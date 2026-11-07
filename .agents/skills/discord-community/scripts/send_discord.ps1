param(
    [Parameter(Mandatory=$true)]
    [string]$Message,
    [string]$Title = "🔥 XTREMGEN // REBEL HUB UPDATE",
    [string]$ChannelId = "1568588114396712982"
)

$ErrorActionPreference = "Stop"
$configPath = Join-Path $PSScriptRoot "..\..\..\plugins\xtremgen-discord\mcp_config.json"
$config = Get-Content $configPath -Raw | ConvertFrom-Json
$token = $config.mcpServers.discord.env.DISCORD_BOT_TOKEN

$headers = @{
    "Authorization" = "Bot $token"
    "Content-Type"  = "application/json"
    "User-Agent"    = "XtremGenBot (https://github.com/javierbrega/XtremGen, 1.0)"
}

$payload = @{
    content = $Message
    embeds  = @(
        @{
            title       = $Title
            description = "Notificación enviada automáticamente desde el entorno de desarrollo de **XtremGen (XG)**."
            color       = 16765440
        }
    )
} | ConvertTo-Json -Depth 6 -Compress

$res = Invoke-RestMethod -Uri "https://discord.com/api/v10/channels/$ChannelId/messages" -Method Post -Headers $headers -Body ([System.Text.Encoding]::UTF8.GetBytes($payload))
Write-Output "Mensaje enviado a Discord (ID: $($res.id))"
