#Requires -RunAsAdministrator
param (
    [Parameter(Mandatory=$true)]
    [string] $Src,
    [Parameter(Mandatory=$true)]
    [string] $Dest
)

New-Item -ItemType SymbolicLink -Path $Dest -Target $Src