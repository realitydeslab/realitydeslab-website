target=`vercel list reality-design | head -n 1`
vercel promote $target --yes
