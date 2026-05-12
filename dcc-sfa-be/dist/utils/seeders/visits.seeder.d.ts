interface MockVisit {
    visit_date?: Date;
    visit_time?: string;
    purpose?: string;
    status?: string;
    start_time?: Date;
    end_time?: Date;
    duration?: number;
    start_latitude?: number;
    start_longitude?: number;
    end_latitude?: number;
    end_longitude?: number;
    check_in_time?: Date;
    check_out_time?: Date;
    orders_created?: number;
    amount_collected?: number;
    visit_notes?: string;
    customer_feedback?: string;
    next_visit_date?: Date;
    is_active: string;
}
declare const mockVisits: MockVisit[];
export declare function seedVisits(): Promise<void>;
export declare function clearVisits(): Promise<void>;
export { mockVisits };
//# sourceMappingURL=visits.seeder.d.ts.map