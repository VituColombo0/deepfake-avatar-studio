import json
import logging
from fastapi import APIRouter, Response, Request
from aiortc import RTCPeerConnection, RTCSessionDescription
from app.services.ai_pipeline import VideoTransformTrack

router = APIRouter()
logger = logging.getLogger("webrtc")

pcs = set()

@router.post("/offer")
async def offer(request: Request):
    params = await request.json()
    offer = RTCSessionDescription(sdp=params["sdp"], type=params["type"])

    pc = RTCPeerConnection()
    pcs.add(pc)

    @pc.on("datachannel")
    def on_datachannel(channel):
        @channel.on("message")
        def on_message(message):
            if isinstance(message, str) and message.startswith("ping"):
                channel.send("pong")

    @pc.on("connectionstatechange")
    async def on_connectionstatechange():
        logger.info("Connection state is %s", pc.connectionState)
        if pc.connectionState == "failed" or pc.connectionState == "closed":
            await pc.close()
            pcs.discard(pc)

    @pc.on("track")
    def on_track(track):
        logger.info("Track %s received", track.kind)
        
        if track.kind == "video":
            avatar_id = request.query_params.get("avatar_id")
            # Envolvemos o vídeo local recebido da webcam na classe AI que aplicará os filtros
            local_video = VideoTransformTrack(track, avatar_id=avatar_id)
            pc.addTrack(local_video)

        @track.on("ended")
        async def on_ended():
            logger.info("Track %s ended", track.kind)

    # Processar offer e gerar answer
    await pc.setRemoteDescription(offer)
    answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    return Response(
        content=json.dumps(
            {"sdp": pc.localDescription.sdp, "type": pc.localDescription.type}
        ),
        media_type="application/json",
    )
