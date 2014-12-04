call gulpw
cd dist
git commit -a -m %*
git tag %*
cd ..
git commit -a -m %*
git tag %*
cd dist
git push origin HEAD:master
git push origin tags/%*
cd ..
git push
git push origin tags/%*