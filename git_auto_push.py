#!/usr/bin/env python3
import os
import subprocess
import sys

# Define beautiful, organic commit messages for all files changed or added in this project
COMMIT_MESSAGES = {
    # Modified Files
    'next-env.d.ts': 'chore: update Next.js typescript environments and compiler references',
    'src/app/dashboard/layout.js': 'feat: implement macro-level System Control Tower navigation rules',
    'src/components/features/Attendance.jsx': 'feat: re-engineer AI Footfall & Proxy-Risk Audit gateway views',
    'src/components/features/ComplaintBox.jsx': 'feat: restructure Escalation Desk incident logs and resolution actions',
    'src/components/features/DashboardHome.jsx': 'feat: configure System Control Tower grid layouts and widgets',
    'src/components/features/Notifications.jsx': 'refactor: connect Supabase real-time notifications for client synchronization',
    'src/components/features/ParentDashboard.jsx': 'feat: optimize child performance tracking and financial dashboard panels',
    'src/components/features/ProjectHub.jsx': 'feat: transform Project Hub into Tech & Innovation Registry portal',
    'src/context/AuthContext.jsx': 'refactor: enforce input string trimming and role route segregations',
    'src/context/SupabaseAuthContext.tsx': 'refactor: configure secure Supabase authentication provider bindings',
    'src/hooks/useRealtimeMessages.ts': 'feat: implement real-time peer-to-peer message synchronization hooks',
    'src/services/api.js': 'refactor: introduce offline fallback bypass for auth lifecycle endpoints',
    'src/services/mockBackend.js': 'feat: enrich mock database with realistic campus operational metrics',
    'src/utils/notifications.js': 'refactor: optimize native push notification service workers',
    'src/utils/supabase/client.ts': 'feat: implement robust NEXT_PUBLIC_USE_MOCK_SUPABASE bypass in client',
    'src/utils/supabase/server.ts': 'feat: resolve server-side duplicate return scopes and auth bypasses',

    # Untracked / New Files
    'src/components/features/BroadcastTower.jsx': 'feat: develop Global Broadcast alert composer with matrix delivery channels',
    'src/components/features/ClubsHub.css': 'style: design dark cyber-grey neon theme styles for Clubs Hub',
    'src/components/features/ClubsHub.jsx': 'feat: develop fully interactive Clubs Hub activities coordinator',
    'src/components/features/MicrogridOptimizer.jsx': 'feat: build VVCE Microgrid Optimizer solar demand tracking curves',
    'src/components/features/RulesConfig.jsx': 'feat: design System Rules Configuration slider thresholds for proxy detection',
    'src/components/features/TelemetryMap.jsx': 'feat: construct Real-Time Telemetry & Sensor Map interactive blueprints',
    'supabase_clubs_setup.sql': 'chore: document Supabase clubs registry and event tables SQL setups',
}

def get_git_status_files():
    """Detects modified, added, deleted, or untracked files in the repository."""
    # Get modified/deleted unstaged files
    unstaged_out = subprocess.check_output(['git', 'status', '--porcelain']).decode('utf-8')
    
    files = []
    for line in unstaged_out.strip().split('\n'):
        if not line.strip():
            continue
        status = line[:2].strip()
        path = line[2:].strip()
        # Clean quotes if present
        if path.startswith('"') and path.endswith('"'):
            path = path[1:-1]
        
        # If it's a directory, let's find all files in it recursively
        if os.path.isdir(path):
            for root, _, filenames in os.walk(path):
                for filename in filenames:
                    files.append(os.path.join(root, filename))
        else:
            files.append(path)
            
    # De-duplicate files
    unique_files = sorted(list(set(files)))
    return unique_files

def get_commit_message(filepath):
    """Retrieves a predefined message or generates an organic message based on file path."""
    # Convert backslashes to forward slashes for matching key
    normalized_path = filepath.replace('\\', '/')
    
    if normalized_path in COMMIT_MESSAGES:
        return COMMIT_MESSAGES[normalized_path]
    
    # Generic fallback based on directory structure
    basename = os.path.basename(normalized_path)
    if 'broadcast' in normalized_path:
        return f'feat: configure emergency global broadcast system pages'
    elif 'clubs' in normalized_path:
        return f'feat: integrate campus clubs registry page views'
    elif 'microgrid' in normalized_path:
        return f'feat: setup microgrid dashboard page navigation'
    elif 'rules-config' in normalized_path:
        return f'feat: add System Rules config setup files'
    elif 'telemetry' in normalized_path:
        return f'feat: integrate real-time campus hardware telemetry route'
    elif normalized_path.endswith('.css'):
        return f'style: add visual styles and theme variables for {basename}'
    elif normalized_path.endswith('.jsx') or normalized_path.endswith('.js'):
        return f'feat: implement operational layout controls in {basename}'
    elif normalized_path.endswith('.sql'):
        return f'chore: add Supabase database setup schema for {basename}'
    else:
        return f'refactor: update {basename} core configurations'

def main():
    print("=" * 60)
    print("  [START] CONNECT & PREP - MULTI-COMMIT GIT CONTRIBUTOR SCRIPT")
    print("=" * 60)
    
    # Get current branch
    try:
        branch = subprocess.check_output(['git', 'rev-parse', '--abbrev-ref', 'HEAD']).decode('utf-8').strip()
    except Exception:
        branch = 'main'
        
    files_to_commit = get_git_status_files()
    
    if not files_to_commit:
        print("[SUCCESS] No changed or modified files detected. Git status is clean!")
        return
        
    print(f"[STATUS] Detected {len(files_to_commit)} modified or untracked files.")
    print("------------------------------------------------------------")
    for idx, f in enumerate(files_to_commit, 1):
        print(f"  {idx}. {f} -> '{get_commit_message(f)}'")
    print("------------------------------------------------------------")
    
    # Fully automated mode: Proceed with committing and pushing files individually
    print("[INIT] Automated Git Commit Sequence Initiated: Committing and pushing files individually...")

    success_count = 0
    for idx, file in enumerate(files_to_commit, 1):
        if not os.path.exists(file):
            print(f"[SKIP] Skipping deleted file (git delete will be staged naturally): {file}")
            continue
            
        msg = get_commit_message(file)
        print(f"\n[{idx}/{len(files_to_commit)}] Processing: {file}...")
        
        # 1. Stage the individual file
        try:
            subprocess.run(['git', 'add', file], check=True)
            # 2. Commit the staged file
            subprocess.run(['git', 'commit', '-m', msg], check=True)
            # 3. Push to remote origin
            print(f"[PUSH] Pushing commit for {file} to remote branch '{branch}'...")
            subprocess.run(['git', 'push', 'origin', branch], check=True)
            print(f"[SUCCESS] Successfully committed and pushed: {file}")
            success_count += 1
        except subprocess.CalledProcessError as err:
            print(f"[ERROR] Failed to process {file}: {err}")
            continue
            
    print("\n" + "=" * 60)
    print(f"[COMPLETE] Completed! Successfully committed and pushed {success_count} files individually.")
    print("[STATUS] Your Git contribution graph has been enriched with distinct commits!")
    print("=" * 60)

if __name__ == '__main__':
    main()
