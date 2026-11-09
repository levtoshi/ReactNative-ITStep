# Налаштування nginx

```nginx options /etc/nginx/sites-available/default
server {
    server_name   salo.itstep.click *.salo.itstep.click;
    client_max_body_size 200M;
    location / {
       proxy_pass         http://localhost:8254;
       proxy_http_version 1.1;
       proxy_set_header   Upgrade $http_upgrade;
       proxy_set_header   Connection keep-alive;
       proxy_set_header   Host $host;
       proxy_cache_bypass $http_upgrade;
       proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header   X-Forwarded-Proto $scheme;
    }
}


sudo systemctl restart nginx
certbot
```

## Налаштування Claude Code у проект
```
irm https://claude.ai/install.ps1 | iex
Test-Path "$env:USERPROFILE\.local\bin\claude.exe"
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";$env:USERPROFILE\.local\bin", "User")

claude --version

claude
/init
Проаналізуй структуру проєкту, технології,
залежності та основні архітектурні рішення та запиши у spec.md

Додай у CLAUDE.md, додай правила кодування, архітектури та тестування.

/cost

/model

claude --resume d7f9c0dd-2e30-43de-8377-b60409718452
```