# local-llm-research-webui-backend

## Requirements

- pipenv, version 2024.0.1


## Build and run

```sh
$ pipenv install
$ pipenv run python main.py
$ pipenv run pyinstaller main.py
$ ./dist/main/main
$ rm -Rf ../frontend/dist/*
$ cp -R ./dist/main/* ../frontend/dist/
```

```sh
$ ollama serve
$ ollama pull llama3.2:1b
$ pipenv run python main.py
```