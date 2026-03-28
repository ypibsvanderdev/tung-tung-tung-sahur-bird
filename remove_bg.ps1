# Elite Billionaire-Tier Background Remover V2.0 (PowerShell)
Add-Type -AssemblyName System.Drawing
$assetsDir = "C:\Users\meqda\.gemini\antigravity\scratch\sahur-bird\assets"
$files = Get-ChildItem -Path $assetsDir -Filter *.png

foreach ($file in $files) {
    Write-Host "Cleaning background: $($file.Name)..."
    $img = [System.Drawing.Bitmap]::FromFile($file.FullName)
    $newImg = New-Object System.Drawing.Bitmap($img.Width, $img.Height)
    
    for ($x = 0; $x -lt $img.Width; $x++) {
        for ($y = 0; $y -lt $img.Height; $y++) {
            $px = $img.GetPixel($x, $y)
            # If the pixel is semi-white, make it transparent
            if ($px.R -gt 230 -and $px.G -gt 230 -and $px.B -gt 230) {
                $newImg.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 255, 255, 255))
            } else {
                $newImg.SetPixel($x, $y, $px)
            }
        }
    }
    
    $img.Dispose()
    # Save to a temp file, then replace
    $tempPath = "$($file.FullName).tmp"
    $newImg.Save($tempPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $newImg.Dispose()
    
    Remove-Item $file.FullName
    Rename-Item $tempPath $file.Name
}
