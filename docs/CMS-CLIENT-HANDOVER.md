# Client CMS handover

Supersedes the earlier ChatGPT/local-D1 test setup. Both CMSs now use separate Supabase Auth accounts and server-backed content. The client's logins are not the developer's ChatGPT, Google, GitHub or Vercel credentials.

Temporary credentials are delivered only in the ignored local `.cms-private/CLIENT-CMS-ACCESS.txt` file after provisioning and verification. Never commit that file or chosen client passwords.

1. Open the appropriate verified website's `/admin/login`.
2. Sign in using that CMS's temporary username and password.
3. Replace BOTH username and password; acknowledge the warning to save and secure the new credentials.
4. Successful replacement signs out all sessions and returns to the login form. It must not open the dashboard automatically.
5. Log in with the new credentials. The old username/password and cookies are no longer valid.
6. Test a small listing edit, publish it, and refresh the matching public website. Restore the edit when finished.

The websites are separate apps and maintain independent CMS accounts, content and media. Changing credentials or content for one does not change the other.

For hosting/access, file limits, backups, failed-change recovery and security limitations see [Dual CMS operations](DUAL-CMS-OPERATIONS.md). For actual final URLs, test counts, dependency audits and deployment status see the final verification report. Do not treat an old private preview URL or an unfinished deployment as verified client access.
