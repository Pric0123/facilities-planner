#!/bin/bash
echo "啟動後端..."
cd /mnt/c/Users/User/facilities-planner/backend
source venv/bin/activate
uvicorn main:app --reload &

echo "啟動前端..."
cd /mnt/c/Users/User/facilities-planner/frontend
npm start

#!/bin/bash
cd /mnt/c/Users/User/facilities-planner/backend
source venv/bin/activate
uvicorn main:app --reload &
cd /mnt/c/Users/User/facilities-planner/frontend
npm start
