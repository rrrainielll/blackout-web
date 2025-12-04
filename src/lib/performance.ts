/**
 * Performance monitoring utilities for tracking API and component performance
 */

interface PerformanceMetric {
    name: string;
    duration: number;
    timestamp: number;
    metadata?: Record<string, unknown>;
}

class PerformanceMonitor {
    private metrics: PerformanceMetric[] = [];
    private maxMetrics = 100; // Keep last 100 metrics in memory

    /**
     * Measure async function execution time
     */
    async measure<T>(
        name: string,
        fn: () => Promise<T>,
        metadata?: Record<string, unknown>
    ): Promise<T> {
        const start = performance.now();

        try {
            const result = await fn();
            const duration = performance.now() - start;

            this.recordMetric({
                name,
                duration,
                timestamp: Date.now(),
                metadata,
            });

            // Log slow operations (> 1 second)
            if (duration > 1000) {
                console.warn(`[Performance] Slow operation detected: ${name} took ${duration.toFixed(2)}ms`, metadata);
            }

            return result;
        } catch (error) {
            const duration = performance.now() - start;

            this.recordMetric({
                name: `${name} (failed)`,
                duration,
                timestamp: Date.now(),
                metadata: { ...metadata, error: error instanceof Error ? error.message : 'Unknown error' },
            });

            throw error;
        }
    }

    /**
     * Measure sync function execution time
     */
    measureSync<T>(
        name: string,
        fn: () => T,
        metadata?: Record<string, unknown>
    ): T {
        const start = performance.now();

        try {
            const result = fn();
            const duration = performance.now() - start;

            this.recordMetric({
                name,
                duration,
                timestamp: Date.now(),
                metadata,
            });

            if (duration > 100) {
                console.warn(`[Performance] Slow sync operation: ${name} took ${duration.toFixed(2)}ms`, metadata);
            }

            return result;
        } catch (error) {
            const duration = performance.now() - start;

            this.recordMetric({
                name: `${name} (failed)`,
                duration,
                timestamp: Date.now(),
                metadata: { ...metadata, error: error instanceof Error ? error.message : 'Unknown error' },
            });

            throw error;
        }
    }

    /**
     * Start a manual measurement
     */
    start(name: string): () => void {
        const start = performance.now();

        return (metadata?: Record<string, unknown>) => {
            const duration = performance.now() - start;

            this.recordMetric({
                name,
                duration,
                timestamp: Date.now(),
                metadata,
            });
        };
    }

    /**
     * Record a metric
     */
    private recordMetric(metric: PerformanceMetric): void {
        this.metrics.push(metric);

        // Keep only last N metrics
        if (this.metrics.length > this.maxMetrics) {
            this.metrics.shift();
        }

        // Log in development
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[Performance] ${metric.name}: ${metric.duration.toFixed(2)}ms`, metric.metadata);
        }
    }

    /**
     * Get performance statistics
     */
    getStats(name?: string): {
        count: number;
        avg: number;
        min: number;
        max: number;
        p95: number;
    } | null {
        const filtered = name
            ? this.metrics.filter(m => m.name === name)
            : this.metrics;

        if (filtered.length === 0) return null;

        const durations = filtered.map(m => m.duration).sort((a, b) => a - b);
        const sum = durations.reduce((a, b) => a + b, 0);

        return {
            count: filtered.length,
            avg: sum / filtered.length,
            min: durations[0],
            max: durations[durations.length - 1],
            p95: durations[Math.floor(durations.length * 0.95)],
        };
    }

    /**
     * Clear all metrics
     */
    clear(): void {
        this.metrics = [];
    }

    /**
     * Get all metrics
     */
    getMetrics(): PerformanceMetric[] {
        return [...this.metrics];
    }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Decorator for measuring method performance
 */
export function measurePerformance(name?: string) {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value;
        const metricName = name || `${target.constructor.name}.${propertyKey}`;

        descriptor.value = async function (...args: any[]) {
            return performanceMonitor.measure(
                metricName,
                () => originalMethod.apply(this, args)
            );
        };

        return descriptor;
    };
}

/**
 * React hook for measuring component render performance
 */
export function usePerformanceMonitor(componentName: string) {
    if (typeof window === 'undefined') return;

    const renderStart = performance.now();

    // Measure on mount
    React.useEffect(() => {
        const duration = performance.now() - renderStart;
        performanceMonitor.measureSync(
            `${componentName} mount`,
            () => duration,
            { type: 'mount' }
        );
    }, []);

    // Measure on unmount
    React.useEffect(() => {
        return () => {
            performanceMonitor.measureSync(
                `${componentName} unmount`,
                () => 0,
                { type: 'unmount' }
            );
        };
    }, []);
}

// Type guard
declare const React: any;
