// model hrms_d_user_role {
//   id          Int         @id(map: "PK__hrms_d_u__3213E83F64B7E424") @default(autoincrement())
//   user_id     Int
//   role_id     Int
//   is_active   String      @default("Y", map: "DF__hrms_d_us__is_ac__2A4B4B5E") @db.Char(1)
//   log_inst    Int         @default(1, map: "DF__hrms_d_us__log_i__2B3F6F97")
//   createdate  DateTime    @default(now(), map: "DF__hrms_d_us__creat__2C3393D0") @db.DateTime
//   updatedate  DateTime?   @db.DateTime
//   createdby   Int         @default(1, map: "DF__hrms_d_us__creat__2D27B809")
//   updatedby   Int?
//   hrms_m_role hrms_m_role @relation(fields: [role_id], references: [id], onUpdate: NoAction, map: "FK_hrms_d_user_role_role")
//   hrms_m_user hrms_m_user @relation(fields: [user_id], references: [id], onUpdate: NoAction, map: "FK_hrms_d_user_role_user")
// }

// model hrms_m_role {
//   id                      Int                       @id(map: "PK__hrms_m_r__3213E83F568348B8") @default(autoincrement())
//   role_name               String                    @db.NVarChar(100)
//   is_active               String                    @default("Y", map: "DF__hrms_m_ro__is_ac__44FF419A") @db.Char(1)
//   log_inst                Int                       @default(1, map: "DF__hrms_m_ro__log_i__45F365D3")
//   createdate              DateTime                  @default(now(), map: "DF__hrms_m_ro__creat__46E78A0C") @db.DateTime
//   updatedate              DateTime?                 @db.DateTime
//   createdby               Int                       @default(1, map: "DF__hrms_m_ro__creat__47DBAE45")
//   updatedby               Int?
//   hrms_d_role_permissions hrms_d_role_permissions[]
//   succession_role         hrms_d_succession_plan[]  @relation("SuccessionRole")
//   hrms_d_user_role        hrms_d_user_role[]
// }

// model hrms_d_role_permissions {
//   id          Int         @id @default(autoincrement())
//   role_id     Int
//   permissions String      @db.NVarChar(Max)
//   is_active   String      @default("Y") @db.Char(1)
//   log_inst    Int         @default(1)
//   createdate  DateTime    @default(now()) @db.DateTime
//   updatedate  DateTime?   @db.DateTime
//   createdby   Int         @default(1)
//   updatedby   Int?
//   hrms_m_role hrms_m_role @relation(fields: [role_id], references: [id], onUpdate: NoAction)
// }
