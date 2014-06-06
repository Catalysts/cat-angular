cd dist
git commit -a -m %*
git tag %*
cd ..
git commit -a -m %*
git tag %*
git submodule update