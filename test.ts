// model sfa_d_requests {
//   id                        Int       @id @default(autoincrement())
//   requester_id              Int
//   request_type              String    @db.NVarChar(100)
//   request_data              String?   @db.NVarChar(Max)
//   status                    String    @default("P") @db.Char(1)
//   reference_id              Int?
//   overall_status            String?   @db.NVarChar(50)
//   createdate                DateTime? @default(now())
//   createdby                 Int
//   updatedate                DateTime?
//   updatedby                 Int?
//   log_inst                  Int?

//   // Relations
//   requester                 users     @relation("sfa_request_requester", fields: [requester_id], references: [id], onDelete: NoAction, onUpdate: NoAction)
//   request_approvals         sfa_d_requests_approval[]
// }
