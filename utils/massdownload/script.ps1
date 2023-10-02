$startDate = Get-Date
if (Test-Path -Path ".\output\") {
    Remove-Item .\output\ -Recurse -Force
}
mkdir .\output\
foreach ($url in Get-Content .\urls.txt) {
    $name = $url -replace "\w+:\/\/(\w+\.?)+\/avatar-decoration-presets\/", ".\output\" -replace "\?(\w+=\w+&?)*", ""
    Write-Output $name
    Invoke-WebRequest $url -OutFile $name
}

$endDate = Get-Date
$secondsTaken = (New-TimeSpan -Start $startDate -End $endDate).TotalSeconds
Write-Output "Finished in $secondsTaken seconds"
