import { useState, useEffect, useCallback, useRef } from 'react';
import { useWebSocket } from './useWebSocket';
import { RTC_CONFIG } from '../lib/constants';
import type { 
  OfferMessage, 
  AnswerMessage, 
  IceCandidateMessage, 
  ViewerJoinedResponse 
} from '../lib/signaling';

type WebRTCMode = 'sender' | 'viewer';

export function useWebRTC(mode: WebRTCMode, deviceName?: string) {
  const { send, on, off } = useWebSocket();
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>('new');
  
  // Sender: viewerId -> PeerConnection
  const pcsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  // Local stream for sender
  const localStreamRef = useRef<MediaStream | null>(null);
  // Sender: viewerId -> isLowBitrate
  const lowBitrateViewersRef = useRef<Set<string>>(new Set());

  const createPC = useCallback((viewerId?: string) => {
    const pc = new RTCPeerConnection(RTC_CONFIG);
    
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        send({
          type: 'ice-candidate',
          target: deviceName,
          viewerId,
          candidate: event.candidate.toJSON()
        });
      }
    };

    pc.onconnectionstatechange = () => {
      setConnectionState(pc.connectionState);
      if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        setRemoteStream(null);
        if (viewerId) pcsRef.current.delete(viewerId);
      }
    };

    if (mode === 'viewer') {
      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0]);
        }
      };
    } else if (mode === 'sender' && localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    return pc;
  }, [mode, deviceName, send]);

  const onViewerJoined = useCallback(async (data: ViewerJoinedResponse) => {
    if (mode !== 'sender') return;
    
    console.log(`[WebRTC] Viewer joined: ${data.viewerId} (lowBitrate: ${data.lowBitrate})`);
    
    if (data.lowBitrate) {
      lowBitrateViewersRef.current.add(data.viewerId);
    }
    
    const pc = createPC(data.viewerId);
    pcsRef.current.set(data.viewerId, pc);
    
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    
    send({
      type: 'offer',
      target: deviceName,
      viewerId: data.viewerId,
      sdp: offer
    });
  }, [mode, deviceName, createPC, send]);

  const onAnswer = useCallback(async (data: AnswerMessage) => {
    if (mode !== 'sender' || !data.viewerId) return;
    
    const pc = pcsRef.current.get(data.viewerId);
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
      
      // Aumenta o bitrate após a conexão ser estabelecida
      pc.getSenders().forEach(sender => {
        if (sender.track?.kind === 'video') {
          const params = sender.getParameters();
          // Força 10 Mbps (10,000,000 bits) ou 500 kbps se for admin preview
          const isLow = lowBitrateViewersRef.current.has(data.viewerId!);
          params.encodings[0].maxBitrate = isLow ? 500000 : 10000000;
          
          sender.setParameters(params).catch(err => 
            console.error('[WebRTC] Error setting bitrate:', err)
          );
        }
      });
    }
  }, [mode]);

  // --- VIEWER HANDLERS ---

  const onOffer = useCallback(async (data: OfferMessage) => {
    if (mode !== 'viewer') return;
    
    console.log('[WebRTC] Received offer from sender');
    // For viewer, we use a single PC (re-creating if needed)
    if (pcsRef.current.has('default')) {
      pcsRef.current.get('default')?.close();
    }
    
    const pc = createPC();
    pcsRef.current.set('default', pc);
    
    await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    
    send({
      type: 'answer',
      target: deviceName,
      sdp: answer
    });
  }, [mode, deviceName, createPC, send]);

  // --- SHARED HANDLERS ---

  const onIceCandidate = useCallback(async (data: IceCandidateMessage) => {
    const id = mode === 'sender' ? data.viewerId : 'default';
    if (!id) return;

    const pc = pcsRef.current.get(id);
    if (pc && data.candidate) {
      await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
  }, [mode]);

  useEffect(() => {
    on('viewer-joined', onViewerJoined);
    on('offer', onOffer);
    on('answer', onAnswer);
    on('ice-candidate', onIceCandidate);

    return () => {
      off('viewer-joined', onViewerJoined);
      off('offer', onOffer);
      off('answer', onAnswer);
      off('ice-candidate', onIceCandidate);
      
      pcsRef.current.forEach(pc => pc.close());
      pcsRef.current.clear();
      lowBitrateViewersRef.current.clear();
    };
  }, [on, off, onViewerJoined, onOffer, onAnswer, onIceCandidate]);

  const addLocalStream = useCallback((stream: MediaStream) => {
    localStreamRef.current = stream;
    // Update existing connections if any (usually none yet as viewers join later)
    pcsRef.current.forEach(pc => {
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
    });
  }, []);

  const reset = useCallback(() => {
    pcsRef.current.forEach(pc => pc.close());
    pcsRef.current.clear();
    setRemoteStream(null);
    setConnectionState('new');
  }, []);

  return {
    remoteStream,
    connectionState,
    addLocalStream,
    reset
  };
}
