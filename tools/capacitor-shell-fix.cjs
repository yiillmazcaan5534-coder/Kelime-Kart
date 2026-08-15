const os = require('os')

os.userInfo = () => ({
  username: process.env.USERNAME || 'developer',
  homedir: process.env.USERPROFILE || process.cwd(),
  shell: process.env.COMSPEC || 'cmd.exe',
  uid: -1,
  gid: -1,
})
