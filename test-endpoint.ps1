$response = Invoke-RestMethod -Uri "http://localhost:3000/quote/test-return-events" -Method POST
$response | ConvertTo-Json -Depth 10 | Out-File -FilePath "test-response.json" -Encoding UTF8
Write-Host "Response saved to test-response.json"
$response