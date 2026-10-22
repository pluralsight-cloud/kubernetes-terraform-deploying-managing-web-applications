: << "CMDBLOCK"
@echo off
rem Terraform runs this with cmd on Windows and sh on Linux. cmd skips the
rem first line as a label and stops at exit. sh treats that line as a heredoc
rem and runs only the python3 command below.
python "%~dp0cleanup.py" %*
exit /b %ERRORLEVEL%
CMDBLOCK
python3 "$(dirname "$0")/cleanup.py" "$@"
