echo "Start with release?"
pause
git submodule update
cd dist
git checkout master
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