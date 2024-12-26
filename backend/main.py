print("This line will be printed.");

# from transformers import pipeline;
# print(pipeline('sentiment-analysis')('we love you'));

# Transformers / open-calm-1b
# import torch
# from transformers import AutoModelForCausalLM, AutoTokenizer

# model = AutoModelForCausalLM.from_pretrained("cyberagent/open-calm-1b", device_map="auto", torch_dtype=torch.float16)
# tokenizer = AutoTokenizer.from_pretrained("cyberagent/open-calm-1b")

# inputs = tokenizer("AIによって私達の暮らしは、", return_tensors="pt").to(model.device)
# with torch.no_grad():
#     tokens = model.generate(
#         **inputs,
#         max_new_tokens=64,
#         do_sample=True,
#         temperature=0.7,
#         top_p=0.9,
#         repetition_penalty=1.05,
#         pad_token_id=tokenizer.pad_token_id,
#     )
    
# output = tokenizer.decode(tokens[0], skip_special_tokens=True)
# print(output)

# Ollama
# from ollama import chat
# from ollama import ChatResponse

# response: ChatResponse = chat(model='llama3.2:1b', messages=[
#   {
#     'role': 'user',
#     'content': 'Why is the sky blue?',
#   },
# ])
# print(response['message']['content'])
# # or access fields directly from the response object
# print(response.message.content)

# Transformers / Llama-3.2-1B

import torch
from transformers import pipeline

model_id = "meta-llama/Llama-3.2-1B"

pipe = pipeline(
    "text-generation", 
    model=model_id, 
    torch_dtype=torch.bfloat16, 
    device_map="auto"
)

pipe("The key to life is")