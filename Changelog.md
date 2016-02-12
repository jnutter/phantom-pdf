0.3.1
-----
Support Phantom 2

0.3.0
-----
Add debug mode to output file as html
Optionally specify path to PhantomJS
Add BSD License
Do not try to render pdf if there is an error in creating the html for phantom to process
Do a SIGKILL if SIGTERM doesn't work
On node process exit, kill all phantom processes

0.2.1
-----
Change the long running script timeout to send SIGKILL
Fix issue of bad arguments error returning a successful exit signal

0.2.0
-----
Add ability to add less variables in manifest
