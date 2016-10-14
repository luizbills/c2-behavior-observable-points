name="observablepoints"
version="0.1"
ext="c2addon"

# delete the old zip
if [ -f $name-*.$ext ]; then
    rm -f $name-*.$ext
fi

# create the new zip
cd ./src
zip -qr ../$name-$version.$ext ./*
echo "created $name-$version.$ext"
