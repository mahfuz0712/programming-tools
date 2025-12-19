#!/bin/bash
set -e

#####################################
# .deb PACKAGE BUILDER
# Usage: ./build-deb.sh <version>
#####################################

# check args
if [ -z "$1" ]; then
  echo "Usage: $0 <version>"
  exit 1
fi

VERSION=$1
PACKAGE_NAME="pt"
ARCH="all"
MAINTAINER="Mohammad Mahfuz Rahman <mahfuzrahman0712@gmail.com>"
DESCRIPTION="A cli tool to inspect how many compilers or interpreters are installed of how many programming languages and their tools respectively"
DEB_BUILD_ROOT="setup/lin"

# paths
CONTROL_FILE="$DEB_BUILD_ROOT/DEBIAN/control"
BIN_SRC="dist/pt"
BIN_DEST="$DEB_BUILD_ROOT/usr/local/bin/pt"

DESKTOP_DIR="$DEB_BUILD_ROOT/usr/share/applications"
ICON_DIR="$DEB_BUILD_ROOT/usr/share/icons/hicolor/128x128/apps"
ICON_SRC="public/icon/icon.png"  # change if your icon differs

#####################################
# 1. Update control file
#####################################

echo "Updating DEBIAN/control..."

cat > "$CONTROL_FILE" <<EOF
Package: $PACKAGE_NAME
Version: $VERSION
Section: utils
Priority: optional
Architecture: $ARCH
Maintainer: $MAINTAINER
Description: $DESCRIPTION
EOF

#####################################
# 2. Prepare directory structure
#####################################

echo "Preparing directory tree..."

mkdir -p "$DEB_BUILD_ROOT/usr/local/bin"
mkdir -p "$DESKTOP_DIR"
mkdir -p "$ICON_DIR"

#####################################
# 3. Copy pt binary
#####################################

echo "Copying binary..."
cp "$BIN_SRC" "$BIN_DEST"
chmod +x "$BIN_DEST"

#####################################
# 4. Create .desktop file
#####################################

echo "Creating .desktop launcher..."

cat > "$DESKTOP_DIR/$PACKAGE_NAME.desktop" <<EOF
[Desktop Entry]
Name=PT
Exec=/usr/local/bin/pt
Icon=$PACKAGE_NAME
Type=Application
Terminal=false
Categories=Utility;
EOF

#####################################
# 5. Install icon
#####################################

if [ -f "$ICON_SRC" ]; then
  echo "Copying icon..."
  cp "$ICON_SRC" "$ICON_DIR/$PACKAGE_NAME.png"
else
  echo "Warning: Icon not found at $ICON_SRC"
fi

#####################################
# 6. Build .deb
#####################################

OUTPUT_DEB="setup/linuxOutput/${PACKAGE_NAME}_${VERSION}_${ARCH}.deb"
echo "Building $OUTPUT_DEB ..."

dpkg-deb --build "$DEB_BUILD_ROOT" "$OUTPUT_DEB"

echo "Done! .deb created at: $OUTPUT_DEB"
