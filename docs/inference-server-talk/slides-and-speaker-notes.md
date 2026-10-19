# Building Your Own AI Assistant
## Inference servers explained — speaker notes & slide text

**Audience:** Gambian developers, students, researchers, and institutional partners (AI-GAMNET)  
**Duration:** ~90 minutes (60 min slides + 30 min live demo / Q&A)  
**Presenter:** [Your name]  
**Demo stack:** Huawei Ascend NPU + vLLM + Open WebUI

---

## How to use this document

- **Slide text** = copy into Google Slides / PowerPoint title + body bullets.
- **Speaker notes** = what to say; not shown on screen.
- **Timing** = suggested minutes per section.

---

# SECTION 0 — Opening (3 min)

---

## Slide 1 — Title

**Slide text:**
```
Building Your Own AI Assistant
How to run an inference server — from HomeGPT to Jollof AI

[Your name] · AI-GAMNET
[Date · Venue]
```

**Speaker notes:**
Welcome everyone. Today we are not talking about building ChatGPT from scratch. We are talking about something much more practical for The Gambia: running your **own** AI chat service on hardware you control — like a mini ChatGPT, HomeGPT, or what some people jokingly call Jollof AI. By the end, you will understand every layer of the stack and see a live demo on our office NPU server.

---

## Slide 2 — What you will leave with

**Slide text:**
```
Today you will understand:

• What “inference” means (vs training)
• The full software stack — hardware to chat UI
• GPU vs NPU vs CPU — what you actually need
• Which models to pick for Gambian use cases
• How to deploy vLLM + Open WebUI on Ascend NPUs
• Security basics before going beyond a lab
```

**Speaker notes:**
Set expectations. This is a practical infrastructure talk, not a deep learning math lecture. You do not need a PhD to run inference. You need the right open-source tools and realistic hardware expectations.

---

## Slide 2b — Who this is for

**Slide text:**
```
For:

• Developers who want a local or on-prem API
• Educators exploring AI in the classroom
• Researchers & institutions (health, ag, gov)
• Anyone tired of sending sensitive data to the cloud
```

**Speaker notes:**
Tie this to AI-GAMNET’s mission: national capacity in agriculture, health, education, and governance. Self-hosted inference keeps data local and builds skills we own.

---

# SECTION 1 — The big picture (5 min)

---

## Slide 3 — ChatGPT vs what we build

**Slide text:**
```
ChatGPT (cloud)                    Your inference server (local/on-prem)
─────────────────                  ───────────────────────────────────
OpenAI owns the GPUs               You own the server
Data goes to the US/cloud           Data stays in your building/country
Pay per token / subscription         Pay once for hardware + electricity
They choose the model              You choose the model
Always online                        Works offline (after setup)
```

**Speaker notes:**
ChatGPT is three things bundled: a **model**, a **serving engine**, and a **web app**. We can unbundle that with open weights and open-source software. The quality gap vs frontier cloud models is real, but for many Gambian use cases — FAQs, drafting, education, document Q&A — a well-chosen 7B–14B model is already useful.

---

## Slide 4 — Names you may hear

**Slide text:**
```
Same idea, different branding:

• HomeGPT      — personal server at home
• Ollama       — popular tool to run models locally
• Open WebUI   — ChatGPT-like web interface
• Jollof AI    — playful name for a Gambian/local assistant
• Dream Server — Nigerian all-in-one local AI stack (open source)
```

**Speaker notes:**
These are not all the same thing. HomeGPT and Jollof AI are **concepts**. Ollama, vLLM, and Open WebUI are **software components** you combine.

---

# SECTION 2 — How inference works (15 min)

---

## Slide 5 — Training vs inference

**Slide text:**
```
Training                          Inference (today’s topic)
────────                          ─────────────────────────
Teach the model from data         Use the trained model to answer
Weeks/months, many GPUs           Milliseconds to seconds per reply
Needs huge datasets               Needs only the user’s prompt
Done by Meta, Alibaba, OpenAI   Done by YOU on your server

Analogy: writing the textbook  →  student taking the exam
```

**Speaker notes:**
Emphasize: countries and labs do not need to train 70B models to benefit from AI. **Serving** an open model is the fast on-ramp. Fine-tuning and RAG come later.

---

## Slide 6 — What is a “model”?

**Slide text:**
```
A model = billions of numbers (weights) + architecture

Examples:
• Qwen2.5-7B-Instruct  →  ~7 billion parameters
• Llama-3-8B           →  ~8 billion parameters

Stored as files on disk (often 4–15 GB after compression)
“7B” ≈ quality/capability tier, not a brand name
```

**Speaker notes:**
When you `ollama pull qwen3:8b`, you download these weight files. The **instruct** variants are tuned to follow chat instructions — use those for assistants, not the raw base models.

---

## Slide 7 — Tokens: the model’s alphabet

**Slide text:**
```
Text → tokens → numbers → model → next token → text

“Hello Banjul” might become 3–4 tokens
Models read and write in tokens, not words

Implications:
• Longer prompts = more compute before the answer starts
• “Context window” = max tokens in + out (e.g. 4K, 32K, 128K)
```

**Speaker notes:**
Quick demo if time: show that weird spellings or code tokenize differently. Context window is a hard limit — stuffing entire books without RAG fails on small windows.

---

## Slide 8 — How generation works (autoregressive)

**Slide text:**
```
1. User sends prompt
2. Tokenize prompt
3. Model processes prompt (prefill)
4. Predict NEXT token
5. Append token to output
6. Repeat step 4–5 until done
7. Stream tokens to the browser

One token at a time — that’s why you see “typing” effect
```

**Speaker notes:**
Draw the loop on a whiteboard if available. **Prefill** is parallel; **decode** is sequential one-token-at-a-time. Most latency users feel is in decode for long answers.

---

## Slide 9 — KV cache (why memory matters)

**Slide text:**
```
During chat, the model must “remember” earlier tokens.

KV cache = memory holding that conversation state.

More users + longer chats = more memory needed.

This is why:
• 7B model might fit in 8 GB for weights alone
• But you still need headroom for KV cache
• Production servers optimize this (vLLM PagedAttention)
```

**Speaker notes:**
This is the “aha” slide for why serving is harder than running one prompt in a notebook. vLLM’s big innovation is managing KV cache like an OS manages RAM.

---

## Slide 10 — Key metrics

**Slide text:**
```
Metric              Meaning
────────────────    ─────────────────────────────────────
Tokens/sec          Speed of generation
Time to first token Latency before answer starts
Context length      How much text model can consider
Concurrency         How many users at once
Quantization        Smaller/faster weights (Q4, INT8, FP16)
```

**Speaker notes:**
For a lab demo, 20–40 tokens/sec feels fine. For a classroom of 30 students hitting one server, you need batching and a production engine — not plain Ollama on one GPU.

---

# SECTION 3 — The full software stack (20 min)

---

## Slide 11 — Five layers (overview diagram)

**Slide text:**
```
[Applications]     RAG, agents, ministry apps, WhatsApp bots
       ↓
[Chat UI]          Open WebUI, LibreChat, custom web app
       ↓
[API gateway]      Optional: LiteLLM, nginx, auth
       ↓
[Inference server] vLLM, Ollama, SGLang, llama.cpp
       ↓
[Runtime/drivers]  CUDA, ROCm, CANN (Ascend), PyTorch
       ↓
[Hardware]         GPU, NPU, or CPU
```

**Speaker notes:**
Walk top-down during the talk, build bottom-up during deployment. Every layer speaks **OpenAI-style HTTP APIs** at the inference layer — that standardization is what makes mixing tools easy.

---

## Slide 12 — Layer 0: Hardware options

**Slide text:**
```
GPU (NVIDIA)     Best docs & ecosystem; RTX 4090, A100, H100
NPU (Ascend)   Huawei AI chips; common in enterprise servers
CPU            Works with tiny models; slow but accessible
Apple Silicon  Great for dev via Ollama + Metal

Pick hardware FIRST — it determines model size
```

**Speaker notes:**
In The Gambia, you may have access to refurbished GPUs, university servers, cloud bursts, or NPUs like ours. There is no single right answer — match model to memory.

---

## Slide 13 — Memory cheat sheet

**Slide text:**
```
Model size (quantized)    Rough memory needed
──────────────────────    ───────────────────
3B–4B Q4                  3–4 GB
7B–8B Q4                  5–8 GB
14B Q4                    10–12 GB
32B Q4                    20–22 GB
70B Q4                    40+ GB

Rule: largest model that fits + ~20% headroom for KV cache
```

**Speaker notes:**
If your NPU has 16 GB per chip, 7B FP16 is realistic; 70B needs many chips or aggressive quantization.

---

## Slide 14 — Layer 1: Drivers & runtime

**Slide text:**
```
NVIDIA GPU  →  CUDA + cuDNN + nvidia-smi
AMD GPU     →  ROCm
Huawei NPU  →  CANN + npu-smi
All         →  PyTorch (most inference servers)

You cannot skip drivers — they connect software to silicon
```

**Speaker notes:**
On our demo server, `npu-smi info` is the equivalent of `nvidia-smi`. CANN must be installed on the host before the vLLM container can see devices.

---

## Slide 15 — Layer 2: Inference engines compared

**Slide text:**
```
Engine      Best for              One-line summary
────────    ────────              ────────────────
Ollama      Learning, 1–5 users    Easiest; not for heavy traffic
vLLM        Production, many users Industry standard; OpenAI API
SGLang      Production            Fast; great for chat & structured output
llama.cpp   CPU / edge / GGUF     Portable; fewer concurrent users
TGI         Legacy HF stacks      Maintenance mode — avoid new projects
```

**Speaker notes:**
Recommend path: learn on **Ollama**, deploy on **vLLM** (or SGLang). Our NPU demo uses **vLLM via vllm-ascend**.

---

## Slide 16 — Why vLLM for production

**Slide text:**
```
vLLM innovations:

• PagedAttention — efficient KV cache memory
• Continuous batching — mix requests without wasting GPU/NPU
• Tensor parallelism — split one model across multiple chips
• OpenAI-compatible REST API — drop-in for most tools

Used by startups, enterprises, and research labs worldwide
```

**Speaker notes:**
You do not need to implement batching yourself. vLLM handles queueing when ten people ask questions at once.

---

## Slide 17 — Why Ollama for learning

**Slide text:**
```
Ollama:

ollama pull qwen3:8b
ollama run qwen3:8b

• Single binary, pulls models automatically
• Great on laptop (Mac/Linux/Windows)
• OpenAI-compatible API on :11434
• Perfect for meetups and first experiments

Not ideal for 50 concurrent users on one machine
```

**Speaker notes:**
If someone in the audience wants homework: install Ollama tonight. Tomorrow they have a local chat model. That lowers the barrier dramatically.

---

## Slide 18 — Layer 3: The API standard

**Slide text:**
```
POST /v1/chat/completions

{
  "model": "qwen2.5-7b-instruct",
  "messages": [
    {"role": "user", "content": "Explain inference simply"}
  ],
  "stream": true
}

Same shape as OpenAI → apps, Python SDKs, and UIs work unchanged
```

**Speaker notes:**
Show curl or Python `openai` client with `base_url="http://server:8000/v1"`. This is how ministries embed AI into existing systems without a chat website.

---

## Slide 19 — Layer 4: Chat frontends

**Slide text:**
```
Open WebUI   Fast setup, RAG built-in, Ollama-native
LibreChat    Multi-provider, teams, SSO, plugins
Custom UI    Full branding — e.g. “Jollof AI” for AI-GAMNET

All connect via OpenAI-compatible URL + API key
```

**Speaker notes:**
Open WebUI is our demo UI. LibreChat if you need LDAP/OAuth and many cloud providers in one pane. For national branding, a thin custom React app on top of the same API is ~1–2 weeks of frontend work.

---

## Slide 20 — Layer 5: Add-ons (optional)

**Slide text:**
```
RAG            Chat with your PDFs (policies, crop guides)
Embeddings     Turn documents into searchable vectors
Vector DB      Chroma, Qdrant, pgvector
Agents         Tools: search, calculators, APIs
Speech         Whisper (speech-to-text), TTS for voice UI
```

**Speaker notes:**
For Gambian agriculture: upload extension-service PDFs, ask “when should I plant millet in Central River Region?” RAG grounds answers in **your** documents, reducing hallucination.

---

## Slide 21 — Three architecture patterns

**Slide text:**
```
A. HomeGPT (simplest)
   Laptop → Ollama → Open WebUI

B. Office server (our demo)
   Ascend NPU → vLLM → Open WebUI

C. Institution
   Load balancer → vLLM cluster → LiteLLM → LibreChat + RAG + SSO
```

**Speaker notes:**
Most audience members start at A. AI-GAMNET lab is at B moving toward C as partners join.

---

# SECTION 4 — NPUs & our demo hardware (8 min)

---

## Slide 22 — What is an NPU?

**Slide text:**
```
NPU = Neural Processing Unit

Purpose-built for matrix math in neural networks
Like GPU, but optimized for inference/training AI workloads

We demo on: Huawei Ascend
• Atlas 800I / 910B — data-center inference & training
• Atlas 300I (310P) — inference accelerator cards
```

**Speaker notes:**
If audience asks “NPU vs GPU”: both work; NVIDIA GPUs have the biggest open-source community. Ascend is strong where those servers are already deployed — use the hardware you have.

---

## Slide 23 — Ascend software stack

**Slide text:**
```
Host OS
  └── CANN driver (Ascend)
        └── Docker: quay.io/ascend/vllm-ascend
              └── vllm serve Qwen/Qwen2.5-7B-Instruct
                    └── Open WebUI → browser

Check health: npu-smi info
```

**Speaker notes:**
We ship a `docker-compose.yml` in the AI-GAMNET repo under `deploy/inference/` with profiles for 310P vs 910B — use the profile that matches your chips.

---

## Slide 24 — 310P vs 910B (important constraints)

**Slide text:**
```
Atlas 310P (300I)                 Atlas 910B / 800I A2
────────────────                  ────────────────────
Inference-focused                 Training + large inference
--enforce-eager required          Standard vLLM modes
--dtype float16 only              FP16/BF16 typical
Set --max-model-len explicitly    Still set max-model-len sanely
May need 2 NPUs (tensor parallel) for 7B

Always test with npu-smi before the talk!
```

**Speaker notes:**
310P is pickier. If demo fails, fallback to recorded video or Ollama on laptop — mention this honestly; it builds trust.

---

# SECTION 5 — Model selection (12 min)

---

## Slide 25 — Open model families (2025–2026)

**Slide text:**
```
Qwen 2.5 / Qwen3   Apache 2.0, multilingual, many sizes ⭐ default
Llama 3 / 4        Huge ecosystem; Meta community license
Mistral            Efficient European models
Gemma              Strong small models from Google
DeepSeek           Excellent reasoning (check license per model)
```

**Speaker notes:**
For new Gambian deployments, **Qwen** is the pragmatic default: permissive license, good multilingual behavior, sizes from 0.6B to 235B.

---

## Slide 26 — Pick by hardware

**Slide text:**
```
Your hardware              Start with
─────────────              ──────────
8 GB VRAM/NPU              Qwen3-4B or Qwen3-8B (Q4)
16 GB                      Qwen3-8B / 14B
24 GB                      Qwen3-14B / 32B
Multi-GPU/NPU server       32B+ or MoE models
CPU only                   Qwen3-0.6B–1.7B, Phi-4-mini
```

**Speaker notes:**
MoE = mixture of experts — large total params but only a subset active per token; good bang for buck if your stack supports it.

---

## Slide 27 — Pick by Gambian use case

**Slide text:**
```
Use case                         Model starting point
────────                         ────────────────────
General chat / education         Qwen2.5-7B-Instruct or Qwen3-8B
Coding workshops                 Qwen2.5-Coder-7B
Multilingual (FR, AR, EN)        Qwen3 family
Local languages (Wolof, Mandinka) Base model + RAG / future fine-tune
Policy / manual Q&A              7B–14B + RAG over PDFs
Many concurrent users            14B+ on vLLM with batching
```

**Speaker notes:**
Base models know **some** Wolof from pretraining but are not reliable for low-resource languages alone. Collect parallel text, use RAG first, fine-tune when you have curated data — AI-GAMNET can lead that pipeline.

---

## Slide 28 — Quantization in plain language

**Slide text:**
```
Full precision (FP16)  →  best quality, most memory
4-bit (Q4 / AWQ / GPTQ) →  ~4× smaller, small quality loss
GGUF (Ollama)          →  easy local quant formats

Production NPU demo: float16 on 310P
Production GPU: AWQ/GPTQ or FP16 depending on VRAM
```

**Speaker notes:**
Quantization is not magic — at 2-bit things get weird. Q4 is the sweet spot for local demos.

---

## Slide 29 — Where to download models

**Slide text:**
```
Hugging Face     huggingface.co — default for vLLM
ModelScope       Often faster in some regions (env var for vLLM)
Ollama library   ollama.com/library — one-command pulls

First download can be 5–50 GB — plan connectivity or USB cache
```

**Speaker notes:**
For Banjul venues with slow internet: pre-download models onto the server the day before. Mount a persistent Docker volume for `/root/.cache`.

---

## Slide 30 — License & responsibility

**Slide text:**
```
✓ Open weights ≠ “no rules” — read the license
✓ Self-hosted ≠ automatically safe — add access control
✓ Health/legal advice needs human oversight
✓ Log policies matter for schools and clinics

On-prem inference helps data stay in-country — you still govern use
```

**Speaker notes:**
Connect to partners like MRC and universities: local inference supports research ethics and patient data sensitivity, but governance is organizational, not automatic.

---

# SECTION 6 — Security & operations (5 min)

---

## Slide 31 — Security checklist

**Slide text:**
```
Before leaving the lab:

☐ Do not expose port 8000 to the public internet raw
☐ Put nginx/Caddy in front with HTTPS
☐ Require API keys even on LAN for workshops
☐ Segment server on private VLAN
☐ Plan power (UPS) and cooling
☐ Document who can access logs
☐ Update CANN, Docker images, and models regularly
```

**Speaker notes:**
Unauthenticated inference endpoints get scraped within hours if public. For demo day, LAN-only Wi‑Fi is fine.

---

## Slide 32 — Gambian operational realities

**Slide text:**
```
Power          UPS/generator for server room
Internet       Large one-time model downloads
Heat/dust      Server placement matters in tropical climates
Cost           Start small; scale with proven use cases
Sovereignty    On-prem = data residency for gov/health/edu
Talent         This talk is step one — ops is ongoing
```

**Speaker notes:**
Be honest: cloud burst (pay-per-hour GPU) can complement local hardware for spikes. Hybrid is OK.

---

# SECTION 7 — Roadmap & AI-GAMNET (5 min)

---

## Slide 33 — From demo to Jollof AI

**Slide text:**
```
Phase 1  Learn      Ollama on one PC (students, meetups)
Phase 2  Pilot      vLLM on NPU/GPU + Open WebUI (AI-GAMNET lab)
Phase 3  Sandbox    RAG with sector docs (ag, health, edu)
Phase 4  Adapt      Fine-tune / LoRA for local languages
Phase 5  Scale      Auth, monitoring, multi-tenant for institutions
```

**Speaker notes:**
Invite audience to join AI-GAMNET — workshops, IndabaX, university partnerships. The infrastructure is enabler; **local datasets and use cases** are the moat.

---

## Slide 34 — RAG vs fine-tuning (one slide)

**Slide text:**
```
RAG                         Fine-tuning
───                         ───────────
Add documents at query time Permanently change model weights
Days to deploy              Weeks + GPU time + curated data
Great for manuals, policies Great for style, dialect, format
Needs vector DB             Needs ML ops discipline

Start with RAG for Wolof/Mandinka projects
```

**Speaker notes:**
Do not let perfect be the enemy of good. A 7B + agricultural PDFs beats waiting six months for a custom model.

---

# SECTION 8 — Live demo script (reference slides)

---

## Slide 35 — Demo architecture

**Slide text:**
```
[Browser] → Open WebUI :3000
                ↓
            vLLM API :8000/v1
                ↓
         vllm-ascend container
                ↓
         Ascend NPU(s) + CANN driver
```

**Speaker notes:**
Transition: “Let me show you the same stack we just diagrammed.”

---

## Slide 36 — Demo commands (reference)

**Slide text:**
```
# On host
npu-smi info
cd deploy/inference
docker compose --profile ascend-910b up -d
# or: --profile ascend-310p

Open http://<server-ip>:3000
```

**Speaker notes:**
Do not live-type long Docker run lines — use compose. Have model pre-cached.

---

## Slide 37 — Demo prompts (Gambia-themed)

**Slide text:**
```
Try asking:

1. “Explain LLM inference for high school students.”
2. “Draft an SMS for farmers about millet planting season.”
3. “Pros and cons of hosting AI in The Gambia?”
4. (With RAG) “Summarize this uploaded policy PDF.”
```

**Speaker notes:**
Pick prompts that succeed on 7B — avoid trick questions on day one.

---

## Slide 38 — For developers: API in 10 lines

**Slide text:**
```python
from openai import OpenAI

client = OpenAI(
    base_url="http://SERVER:8000/v1",
    api_key="local",
)
r = client.chat.completions.create(
    model="Qwen/Qwen2.5-7B-Instruct",
    messages=[{"role": "user", "content": "Hello from Banjul"}],
)
print(r.choices[0].message.content)
```

**Speaker notes:**
Same code works against OpenAI — change URL and key. That portability is the point.

---

# SECTION 9 — Close (3 min)

---

## Slide 39 — What to do Monday

**Slide text:**
```
Homework path (zero NPU required):

1. Install Ollama → ollama.com
2. ollama pull qwen3:8b
3. Run Open WebUI in Docker
4. Chat locally — data never leaves your machine

When ready: AI-GAMNET deploy/inference for NPU production path
```

**Speaker notes:**
Lower the barrier. NPUs are for scale; laptops are for learning.

---

## Slide 40 — Resources

**Slide text:**
```
vLLM              docs.vllm.ai
vLLM Ascend       docs.vllm.ai/projects/ascend
Ollama            ollama.com
Open WebUI        docs.openwebui.com
Models            huggingface.co/Qwen
AI-GAMNET         gamainet.org · /join
```

**Speaker notes:**
Share slide deck and compose files after the session.

---

## Slide 41 — Q&A

**Slide text:**
```
Questions?

Try the demo stations after the talk.
```

**Speaker notes:**
Common questions to prep:
- “Can it work offline?” Yes, after models are downloaded.
- “How much electricity?” Give rough server TDP estimate for your box.
- “Is it free?” Software yes; hardware and power are not.
- “Can it replace ChatGPT?” For some tasks yes; for frontier reasoning, hybrid with cloud is realistic.

---

# APPENDIX — Timing guide

| Section | Slides | Minutes |
|---------|--------|---------|
| Opening | 1–2b | 3 |
| Big picture | 3–4 | 5 |
| Inference deep dive | 5–10 | 15 |
| Software stack | 11–21 | 20 |
| NPU / demo hardware | 22–24 | 8 |
| Model selection | 25–30 | 12 |
| Security | 31–32 | 5 |
| Roadmap | 33–34 | 5 |
| Demo | 35–38 | 20–30 |
| Close | 39–41 | 3 + Q&A |

**Total:** ~60 min content + demo/Q&A buffer

---

# APPENDIX — Backup plan

If NPU demo fails live:

1. Show `npu-smi info` screenshot slide.
2. Switch to laptop Ollama demo (pre-installed).
3. Play 2-minute screen recording of vLLM streaming tokens.
4. Walk through `docker compose logs` — teaching moment on debugging.

Never skip the conceptual stack — that is the lasting value.
