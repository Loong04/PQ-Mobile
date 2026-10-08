$ErrorActionPreference = 'Stop'
$sourceRoot = [System.IO.Path]::GetFullPath('C:\Users\loong\PQ-Mobile\scratch\peoplehcm-web')
$deliveryRoot = [System.IO.Path]::GetFullPath('C:\Users\loong\Documents\PeopleHCM-Web')
$backupRoot = [System.IO.Path]::GetFullPath('C:\Users\loong\PQ-Mobile\scratch\peoplehcm-structure-backup-20261008')
if ($sourceRoot -ne 'C:\Users\loong\PQ-Mobile\scratch\peoplehcm-web' -or $deliveryRoot -ne 'C:\Users\loong\Documents\PeopleHCM-Web' -or $backupRoot -ne 'C:\Users\loong\PQ-Mobile\scratch\peoplehcm-structure-backup-20261008') { throw 'Unexpected absolute target path' }
if (Test-Path -LiteralPath $backupRoot) { throw 'Backup already exists; inspect before proceeding' }

function Get-CheckedPath([string] $base, [string] $relative) {
    $candidate = [System.IO.Path]::GetFullPath((Join-Path $base $relative))
    if (-not $candidate.StartsWith($base + '\', [System.StringComparison]::OrdinalIgnoreCase)) { throw "Path escapes authorized directory: $candidate" }
    return $candidate
}

$baseline = Get-Content -LiteralPath 'C:\Users\loong\PQ-Mobile\scratch\peoplehcm-structure-delivery-baseline.json' -Raw -Encoding UTF8 | ConvertFrom-Json
$expected = @{}
foreach ($property in $baseline.PSObject.Properties) {
    $expected[$property.Name] = $property.Value
    $original = Get-CheckedPath $deliveryRoot $property.Name
    if (-not (Test-Path -LiteralPath $original -PathType Leaf)) { throw "Original changed or removed since audit: $original" }
    $hash = (Get-FileHash -LiteralPath $original -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($hash -ne $property.Value) { throw "User edit detected; preserve and merge before delivery: $original" }
}
foreach ($folder in @('src', 'scripts', 'tests', 'docs')) {
    $originalFolder = Get-CheckedPath $deliveryRoot $folder
    foreach ($file in Get-ChildItem -LiteralPath $originalFolder -Recurse -File) {
        $relative = $file.FullName.Substring($deliveryRoot.Length + 1).Replace('\', '/')
        if (-not $expected.ContainsKey($relative)) { throw "New file detected since audit: $relative" }
    }
}

New-Item -ItemType Directory -Path $backupRoot | Out-Null
foreach ($folder in @('src', 'scripts', 'tests', 'docs')) {
    $originalFolder = Get-CheckedPath $deliveryRoot $folder
    $backupFolder = Get-CheckedPath $backupRoot $folder
    Move-Item -LiteralPath $originalFolder -Destination $backupFolder
}
foreach ($folder in @('src', 'tooling', 'tests', 'docs')) {
    $newFolder = Get-CheckedPath $sourceRoot $folder
    $destinationFolder = Get-CheckedPath $deliveryRoot $folder
    if (Test-Path -LiteralPath $destinationFolder) { throw "Unexpected new folder conflict: $destinationFolder" }
    Copy-Item -LiteralPath $newFolder -Destination $destinationFolder -Recurse
}
foreach ($relative in @('README.md', 'package.json', 'package-lock.json', 'index.html', 'vite.config.ts', '.prettierignore', 'database\README.md', 'public\web-entry.js')) {
    $original = Get-CheckedPath $deliveryRoot $relative
    $backup = Get-CheckedPath $backupRoot $relative
    $updated = Get-CheckedPath $sourceRoot $relative
    New-Item -ItemType Directory -Path (Split-Path $backup -Parent) -Force | Out-Null
    Copy-Item -LiteralPath $original -Destination $backup
    Copy-Item -LiteralPath $updated -Destination $original -Force
}
$oldVerifier = Get-CheckedPath $deliveryRoot 'database\verify-export.mjs'
if (Test-Path -LiteralPath $oldVerifier) {
    Move-Item -LiteralPath $oldVerifier -Destination (Get-CheckedPath $backupRoot 'database\verify-export.mjs')
}
Write-Output 'Professional directory structure delivered; original files backed up outside the delivered project.'
Write-Output "Delivery: $deliveryRoot"
Write-Output "Backup: $backupRoot"
