OptiBuy Android AAB Build Instructions
Prerequisites
GitHub account (✅ You have this)
Codemagic account (✅ You have this)
Android signing keystore
Google Play Console access
Step 1: GitHub Repository Setup
Create a new repository on GitHub named optibuy-collective
Push this code to the repository:
git init
git add .
git commit -m "Initial OptiBuy collective purchasing platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/optibuy-collective.git
git push -u origin main
Step 2: Codemagic Configuration
Connect your GitHub repository to Codemagic
The codemagic.yaml file is already configured for OptiBuy
Set up the following environment variables in Codemagic:
Required Environment Variables:
CM_KEYSTORE: Base64 encoded keystore file
CM_KEYSTORE_PASSWORD: Keystore password
CM_KEY_ALIAS_PASSWORD: Key alias password
CM_KEY_ALIAS: Key alias name (e.g., "optibuy-key")
GCLOUD_SERVICE_ACCOUNT_CREDENTIALS: Google Play service account JSON
Required Environment Groups:
google_play: For Google Play publishing credentials
Step 3: Android Signing Setup
Create a keystore for OptiBuy:

keytool -genkey -v -keystore optibuy-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias optibuy-key
Upload the keystore to Codemagic as a signing certificate.

Step 4: Build AAB
Trigger the android-workflow in Codemagic
The workflow will:
Install dependencies
Build web assets
Setup Android platform
Generate signed AAB file
Upload to Google Play Console (alpha track)
Expected Output
AAB file: android/app/build/outputs/bundle/release/app-release.aab
Mapping file: android/app/build/outputs/mapping/release/mapping.txt
Google Play Console
The AAB will be automatically uploaded to the alpha track as a draft for closed testing.

App Configuration
App ID: com.optibuy.collective
App Name: OptiBuy
Version: Based on package.json version
Target SDK: Latest Android SDK
Troubleshooting
Ensure all environment variables are set correctly
Verify keystore credentials match
Check that Google Play service account has proper permissions
Review build logs in Codemagic for specific errors
Success Indicators
✅ Clean build without errors
✅ AAB file generated
✅ Upload to Google Play Console successful
✅ Available in closed testing
