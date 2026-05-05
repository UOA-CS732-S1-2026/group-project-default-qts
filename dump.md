temp file for throwaway items related to the project. should be deleted before submission.


Connecting with MongoDB Driver
mongodb+srv://admin_user:<ineedagrowfriend>@growfriend.sw5wiis.mongodb.net/?appName=GrowFriend



# Member A API Contract

## POST /api/auth/register
Request:
```json
{
  "name": "Test User",
  "email": "testuser@aucklanduni.ac.nz",
  "password": "TestPass123!",
  "securityQuestionCode": "PET_NAME",
  "securityAnswer": "Fluffy"
}
```

Success (201):
```json
{
  "success": true,
  "message": "Registered successfully",
  "data": {
    "token": "<jwt>",
    "user": {
      "id": "<userId>",
      "name": "Test User",
      "email": "testuser@aucklanduni.ac.nz",
      "coins": 30,
      "roles": ["USER"],
      "activePetId": "<petId>"
    },
    "defaultPet": {
      "id": "<petId>",
      "speciesId": "<speciesId>",
      "stage": "EGG",
      "status": "ACTIVE"
    }
  }
}
```

## POST /api/auth/login
Request:
```json
{
  "email": "testuser@aucklanduni.ac.nz",
  "password": "TestPass123!"
}
```

Success (200):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "<jwt>",
    "user": {
      "id": "<userId>",
      "name": "Test User",
      "email": "testuser@aucklanduni.ac.nz",
      "coins": 30,
      "roles": ["USER"],
      "activePetId": "<petId>"
    }
  }
}
```

## GET /api/users/me
Header:
`Authorization: Bearer <jwt>`

Success (200):
```json
{
  "success": true,
  "message": "User profile loaded",
  "data": {
    "id": "<userId>",
    "name": "Test User",
    "email": "testuser@aucklanduni.ac.nz",
    "coins": 30,
    "roles": ["USER"],
    "activePetId": "<petId>",
    "createdAt": "<iso>",
    "updatedAt": "<iso>"
  }
}
```

## GET /api/dashboard
Header:
`Authorization: Bearer <jwt>`

Success (200):
```json
{
  "success": true,
  "message": "Dashboard loaded",
  "data": {
    "userSummary": {
      "id": "<userId>",
      "name": "Test User",
      "email": "testuser@aucklanduni.ac.nz",
      "coins": 30,
      "roles": ["USER"]
    },
    "activePetSummary": {
      "id": "<petId>",
      "speciesId": "<speciesId>",
      "speciesCode": "TAO_KIWI",
      "speciesName": "Tao-Kiwi",
      "nickname": "",
      "stage": "EGG",
      "level": 1,
      "growthPoints": 0,
      "evolutionReady": false,
      "status": "ACTIVE"
    },
    "storeFlags": {
      "randomEgg": {
        "listed": true,
        "price": 200,
        "canAfford": false,
        "unlockRule": "PET_ADULT",
        "eggUnlocked": false
      }
    }
  }
}
```





forget password -> user security answer wrong case -

userApi.js:64 
 POST http://localhost:5000/api/auth/forgot/reset 401 (Unauthorized)
resetPasswordWithSecurityAnswer	@	userApi.js:64
resetPassword	@	AppContext.jsx:125
onStep2	@	ForgotPasswordModal.jsx:80


