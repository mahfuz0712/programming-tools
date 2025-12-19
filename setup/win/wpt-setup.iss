[Setup]
AppName=Programming Tools
AppVersion=1.0.0
DefaultDirName={pf}\Mohammad Mahfuz Rahman\Programming Tools
DefaultGroupName=Programming Tools
OutputBaseFilename=setup
Compression=lzma
SolidCompression=yes
PrivilegesRequired=admin

[Files]
Source: "D:\JavaScript Projects\Programming Tools\dist\pt.exe"; DestDir: "{app}"; Flags: ignoreversion 

[Run]
; Add the application path to the system's environment variable
Filename: "cmd"; Parameters: "/c setx PATH ""{app};%PATH%"""; Flags: runhidden

[Icons]
Name: "{group}\PT"; Filename: "{app}\pt.exe"
Name: "{group}\Uninstall PT"; Filename: "{uninstallexe}"

[UninstallDelete]
Type: filesandordirs; Name: "{app}"

[UninstallRun]
; Remove the application path from the system's environment variable on uninstall
Filename: "cmd"; Parameters: "/c setx PATH ""%PATH:{app};=%"""; Flags: runhidden
