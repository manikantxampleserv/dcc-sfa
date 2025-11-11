model attendance {
  id                    Int       @id @default(autoincrement())
  user_id               Int
  punch_in_time         DateTime
  punch_in_latitude     Decimal?  @db.Decimal(10, 8)
  punch_in_longitude    Decimal?  @db.Decimal(11, 8)
  punch_in_address      String?   @db.NVarChar(500)
  punch_in_photo        String?   @db.NVarChar(500)
  punch_in_device_info  String?   @db.NVarChar(255)
  
  punch_out_time        DateTime?
  punch_out_latitude    Decimal?  @db.Decimal(10, 8)
  punch_out_longitude   Decimal?  @db.Decimal(11, 8)
  punch_out_address     String?   @db.NVarChar(500)
  punch_out_photo       String?   @db.NVarChar(500)
  punch_out_device_info String?   @db.NVarChar(255)
  
  total_hours           Decimal?  @db.Decimal(5, 2)
  work_type             String?   @default("field") @db.NVarChar(20) // field, office, remote
  status                String?   @default("active") @db.NVarChar(20) // active, completed, auto_closed
  
  remarks               String?   @db.NVarChar(500)
  is_active             String    @default("Y") @db.Char(1)
  createdate            DateTime? @default(now()) @db.DateTime
  createdby             Int
  updatedate            DateTime? @db.DateTime
  updatedby             Int?
  log_inst              Int?
  
  user                  users     @relation(fields: [user_id], references: [id], onDelete: Cascade, onUpdate: NoAction)
  
  @@index([user_id, punch_in_time])
}