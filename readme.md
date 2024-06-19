# Alchemy Unbound Frontend


## Preparing release workflow

ESCAPE CHARACTER WITH `` ` (~)``

`./steamcmd.exe +login alchemyunbound PASSWORD +quit`

validate with

`./steamcmd.exe +login <username> +quit`

Reauth with

`./steamcmd.exe +set_steam_guard_code <code>`

output to base64

``` powershell
$Location = (Get-Location).Path
$InputPath = Join-Path -Path (Join-Path -Path $Location -ChildPath 'config') -ChildPath 'config.vdf'
$OutputPath = Join-Path -Path $Location -ChildPath 'config_base64.txt'
$InputFile = Get-Content $InputPath -Encoding byte
$Base64Output = [System.Convert]::ToBase64String($InputFile)
$Base64Output | Out-File $OutputPath
```

```
options (Endpoint needs to come last)

--server dev --logLevel silly --endpoint http://localhost:5001
--server prerelease --logLevel silly
```
