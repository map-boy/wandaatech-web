content = open('app/competitions/page.tsx', 'r', encoding='utf-8').read()
fixed = content.replace('fetchLeaderboard([selectedComp.id](http://selectedComp.id))', 'fetchLeaderboard(selectedComp.id)')
open('app/competitions/page.tsx', 'w', encoding='utf-8').write(fixed)
print('Done')
