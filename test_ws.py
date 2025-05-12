import asyncio
import websockets

async def run():
    uri = "ws://localhost:8000/ws/chat"
    try:
        async with websockets.connect(uri) as ws:
            await ws.send("👋 Hello World")
            msg = await ws.recv()
            print("✅ Received:", msg)
    except Exception as e:
        print("❌ Error:", e)

asyncio.run(run())
