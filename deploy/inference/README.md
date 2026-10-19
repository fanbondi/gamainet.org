# Inference server deployment (Ascend NPU)

Docker Compose stack for AI-GAMNET talks and lab demos:

**vLLM (Ascend)** → OpenAI-compatible API  
**Open WebUI** → ChatGPT-like browser UI

Full talk material: [`docs/inference-server-talk/slides-and-speaker-notes.md`](../../docs/inference-server-talk/slides-and-speaker-notes.md)

## Prerequisites

On the **host** (not inside Docker):

1. Huawei **CANN** driver installed and working
2. **Docker** with permission to pass Ascend devices
3. Verify NPUs: `npu-smi info`
4. Identify chip type:
   - **910B / Atlas 800I A2** → profile `ascend-910b`
   - **310P / Atlas 300I Duo** → profile `ascend-310p`

## Quick start

```bash
cd deploy/inference
cp .env.example .env
# Edit .env — set VLLM_MODEL, ports, device paths if needed

# Atlas 910B / 800I A2
docker compose --profile ascend-910b up -d

# OR Atlas 310P (300I)
docker compose --profile ascend-310p up -d
```

Wait for the model download on first run (can be 5–20 minutes depending on bandwidth). Monitor:

```bash
docker compose --profile ascend-910b logs -f vllm-910b
# or
docker compose --profile ascend-310p logs -f vllm-310p
```

When healthy:

| Service | URL |
|---------|-----|
| Open WebUI | http://localhost:3000 |
| vLLM API | http://localhost:8000/v1 |
| List models | `curl http://localhost:8000/v1/models` |

Register the first Open WebUI account — it becomes admin.

## Profiles

| Profile | Hardware | vLLM service | Notes |
|---------|----------|--------------|-------|
| `ascend-910b` | Atlas 910B, 800I A2 | `vllm-910b` | Default; 7B on 1 NPU |
| `ascend-310p` | Atlas 300I (310P) | `vllm-310p` | Requires `--enforce-eager`, `float16`; 7B often needs 2 NPUs |

Both vLLM services register network alias `vllm` so Open WebUI always uses `http://vllm:8000/v1`.

## 310P constraints

If you see OOM or startup errors on 310P:

1. Lower `VLLM_MAX_MODEL_LEN_310P` (try `2048`)
2. Confirm `VLLM_TENSOR_PARALLEL_310P=2` if you have two cards
3. Use a smaller model: `Qwen/Qwen2.5-3B-Instruct`
4. Verify image tag matches your CANN version on [quay.io/ascend/vllm-ascend](https://quay.io/repository/ascend/vllm-ascend)

## Pre-download models (recommended before a talk)

On a machine with good internet, pull once into the shared volume:

```bash
docker compose --profile ascend-910b run --rm vllm-910b \
  python -c "from huggingface_hub import snapshot_download; snapshot_download('Qwen/Qwen2.5-7B-Instruct')"
```

Or mount a host directory with models already cached under the `model-cache` volume.

## Test the API

```bash
curl http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Qwen/Qwen2.5-7B-Instruct",
    "messages": [{"role": "user", "content": "Explain inference in one sentence."}]
  }'
```

## Stop / reset

```bash
docker compose --profile ascend-910b down
# Remove cached models (large):
# docker volume rm aigamnet-model-cache
```

## Security (lab vs production)

This compose file is for **lab demos on a trusted LAN**:

- Do not expose ports 8000/3000 to the public internet without TLS and authentication
- Set `ENABLE_SIGNUP=false` after creating admin users
- Put nginx/Caddy with HTTPS in front for anything beyond a meetup

## Troubleshooting

| Symptom | Check |
|---------|-------|
| Container exits immediately | `npu-smi info` on host; device paths in `.env` |
| OOM on 310P | Reduce `max-model-len`; use 2 NPUs; smaller model |
| Open WebUI “connection error” | vLLM not healthy yet — wait for healthcheck |
| Slow first start | Normal — model download; check `model-cache` volume |

```bash
npu-smi info
docker compose --profile ascend-910b ps
docker compose --profile ascend-910b logs vllm-910b --tail 100
```
