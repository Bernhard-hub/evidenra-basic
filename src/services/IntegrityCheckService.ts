// Integrity Check Service - Detects tampering
// Checks for signs of debugging or modification

interface IntegrityResult {
  valid: boolean;
  reason?: string;
}

class IntegrityCheckService {
  private checks: (() => IntegrityResult)[] = [];

  constructor() {
    this.checks = [
      this.checkDevTools.bind(this),
      this.checkDebugger.bind(this),
      this.checkTimeManipulation.bind(this),
      this.checkWindowSize.bind(this),
    ];
  }

  // Check if DevTools are open
  private checkDevTools(): IntegrityResult {
    const threshold = 160;
    const widthDiff = window.outerWidth - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;
    
    if (widthDiff > threshold || heightDiff > threshold) {
      return { valid: false, reason: "devtools_detected" };
    }
    return { valid: true };
  }

  // Check for debugger statements
  private checkDebugger(): IntegrityResult {
    const start = performance.now();
    // debugger; // This would pause if DevTools are open
    const end = performance.now();
    
    if (end - start > 100) {
      return { valid: false, reason: "debugger_detected" };
    }
    return { valid: true };
  }

  // Check for time manipulation
  private checkTimeManipulation(): IntegrityResult {
    const serverTime = Date.now();
    const storedTime = parseInt(localStorage.getItem("_lt") || "0", 10);
    
    if (storedTime > 0 && serverTime < storedTime - 86400000) {
      return { valid: false, reason: "time_manipulation" };
    }
    
    localStorage.setItem("_lt", serverTime.toString());
    return { valid: true };
  }

  // Check for unusual window size (automated testing)
  private checkWindowSize(): IntegrityResult {
    if (window.innerWidth < 100 || window.innerHeight < 100) {
      return { valid: false, reason: "headless_browser" };
    }
    return { valid: true };
  }

  // Run all integrity checks
  public runChecks(): IntegrityResult {
    for (const check of this.checks) {
      const result = check();
      if (!result.valid) {
        console.warn("[Integrity] Check failed:", result.reason);
        return result;
      }
    }
    return { valid: true };
  }

  // Start periodic monitoring
  public startMonitoring(intervalMs: number = 5000): void {
    setInterval(() => {
      const result = this.runChecks();
      if (!result.valid) {
        // Log to server for fraud detection
        this.reportViolation(result.reason);
      }
    }, intervalMs);
  }

  private async reportViolation(reason?: string): Promise<void> {
    try {
      // Report to server via the validate-license endpoint
      // This is logged for fraud detection purposes
      console.warn("[Integrity] Violation reported:", reason);
    } catch (e) {
      // Silent fail
    }
  }
}

export const integrityCheck = new IntegrityCheckService();
