# Generate web-sized JPEGs without changing the supplied source photographs.
# Windows PowerShell / System.Drawing; no additional npm dependency is required.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$projectRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$sourceDirectory = Join-Path $projectRoot 'src/assets/buildings'
$outputDirectory = Join-Path $sourceDirectory 'optimized'
New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null
$encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
	Where-Object MimeType -eq 'image/jpeg' | Select-Object -First 1
$jobs = @(
	@{ Source = 'Cruzen-Murray_Library,_College_of_Idaho-exterior.jpg'; Output = 'library-exterior.jpg'; MaximumEdge = 1600 },
	@{ Source = 'Cruzen-Murray_Library,_College_of_Idaho-interior.jpg'; Output = 'library-interior.jpg'; MaximumEdge = 1200 },
	@{ Source = 'sterry-hall-1.jpg'; Output = 'sterry-hall-1.jpg'; MaximumEdge = 1200 }
)

foreach ($job in $jobs) {
	$sourcePath = Join-Path $sourceDirectory $job.Source
	$outputPath = Join-Path $outputDirectory $job.Output
	$image = [System.Drawing.Image]::FromFile($sourcePath, $true)
	try {
		if ($image.PropertyIdList -contains 274) {
			$orientation = [BitConverter]::ToUInt16($image.GetPropertyItem(274).Value, 0)
			$rotations = @{ 2 = 'RotateNoneFlipX'; 3 = 'Rotate180FlipNone'; 4 = 'Rotate180FlipX'; 5 = 'Rotate90FlipX'; 6 = 'Rotate90FlipNone'; 7 = 'Rotate270FlipX'; 8 = 'Rotate270FlipNone' }
			if ($rotations.ContainsKey([int]$orientation)) {
				$image.RotateFlip([System.Drawing.RotateFlipType]$rotations[[int]$orientation])
			}
		}
		$scale = [Math]::Min([double]1, $job.MaximumEdge / [double][Math]::Max($image.Width, $image.Height))
		$width = [int][Math]::Round($image.Width * $scale)
		$height = [int][Math]::Round($image.Height * $scale)
		$bitmap = New-Object System.Drawing.Bitmap($width, $height)
		try {
			$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
			try {
				$graphics.Clear([System.Drawing.Color]::White)
				$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
				$graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
				$graphics.DrawImage($image, 0, 0, $width, $height)
			} finally { $graphics.Dispose() }
			$parameters = New-Object System.Drawing.Imaging.EncoderParameters(1)
			try {
				$parameters.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]82)
				# Only these named generated derivatives are replaced when rerun.
				$stream = [System.IO.File]::Open($outputPath, [System.IO.FileMode]::Create)
				try { $bitmap.Save($stream, $encoder, $parameters) } finally { $stream.Dispose() }
			} finally { $parameters.Dispose() }
		} finally { $bitmap.Dispose() }
		[pscustomobject]@{
			File = $job.Output
			Dimensions = "${width}x${height}"
			OriginalBytes = (Get-Item -LiteralPath $sourcePath).Length
			OptimizedBytes = (Get-Item -LiteralPath $outputPath).Length
		}
	} finally { $image.Dispose() }
}
