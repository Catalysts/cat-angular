@echo off
echo "Start with release?"
pause
git tag pre-release-%*
git submodule update
cd dist
git checkout master
git tag pre-release-%*
cd ..
call gulpw
cd dist
git commit -a -m %*
git tag %*
cd ..
git commit -a -m %*
git tag %*
cd dist
echo "Push release to github?"
pause
git push origin HEAD:master
git push origin tags/%*
cd ..
git push
git push origin tags/%*
echo "Remove pre-relase tags?"
pause
cd dist
git tag -d pre-release-%*
cd ..
git tag -d pre-release-%*
