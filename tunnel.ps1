$ErrorActionPreference = "SilentlyContinue"
$logFile = "C:\Users\Khanh Trinh\.gemini\antigravity\scratch\springboot-base-template\tunnel_url.txt"

while ($true) {
    ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=15 -o ServerAliveCountMax=999 -R 80:localhost:8080 nokey@localhost.run 2>&1 | ForEach-Object {
        $line = $_.ToString()
        if ($line -match "https://[a-zA-Z0-9.-]+\.lhr\.life") {
            $matches[0] | Out-File -FilePath $logFile -Encoding utf8
        }
    }
    Start-Sleep -Seconds 2
}
