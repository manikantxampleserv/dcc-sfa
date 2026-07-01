"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeDefs = void 0;
const apollo_server_express_1 = require("apollo-server-express");
exports.typeDefs = (0, apollo_server_express_1.gql) `
  scalar DateTime
  scalar Decimal

  type AssetMaster {
    id: Int!
    assetTypeId: Int!
    assetSubTypeId: Int
    name: String!
    code: String!
    serialNumber: String
    purchaseDate: DateTime
    warrantyExpiry: DateTime
    currentLocation: String
    currentStatus: String
    assignedTo: String
    isActive: String!
    createdate: DateTime
    createdby: Int!
    updatedate: DateTime
    updatedby: Int
    logInst: Int
    assetType: AssetType
    assetSubType: AssetSubType
    assetImages: [AssetImage]
    assetMaintenance: [AssetMaintenance]
  }

  type Cooler {
    id: Int!
    customerId: Int!
    code: String!
    assetMasterId: Int
    brand: String
    model: String
    serialNumber: String
    capacity: Int
    installDate: DateTime
    lastServiceDate: DateTime
    nextServiceDue: DateTime
    coolerTypeId: Int
    coolerSubTypeId: Int
    status: String
    temperature: Decimal
    energyRating: String
    warrantyExpiry: DateTime
    maintenanceContract: String
    technicianId: Int
    lastScannedDate: DateTime
    isActive: String!
    createdate: DateTime
    createdby: Int!
    updatedate: DateTime
    updatedby: Int
    logInst: Int
    assetMaster: AssetMaster
    customer: Customer
    technician: User
    coolerType: CoolerType
    coolerSubType: CoolerSubType
    coolerInspections: [CoolerInspection]
  }

  type CoolerInspection {
    id: Int!
    coolerId: Int
    visitId: Int
    inspectedBy: Int!
    inspectionDate: DateTime
    temperature: Decimal
    isWorking: String
    issues: String
    images: String
    latitude: Decimal
    longitude: Decimal
    actionRequired: String
    actionTaken: String
    nextInspectionDue: DateTime
    isActive: String
    createdate: DateTime
    createdby: Int!
    updatedate: DateTime
    updatedby: Int
    logInst: Int
    cooler: Cooler
    inspector: User
    visit: Visit
  }

  # Related types for relations
  type AssetType {
    id: Int!
    name: String!
    description: String
  }

  type AssetSubType {
    id: Int!
    name: String!
    description: String
  }

  type AssetImage {
    id: Int!
    assetId: Int!
    imageUrl: String!
    createdate: DateTime
    assetMaster: AssetMaster
  }

  type AssetMaintenance {
    id: Int!
    assetId: Int!
    maintenanceDate: DateTime!
    description: String!
    cost: Decimal
    performedBy: String
    nextMaintenanceDate: DateTime
  }

  type Customer {
    id: Int!
    name: String!
    code: String!
    email: String
    phone: String
  }

  type User {
    id: Int!
    username: String!
    email: String!
    firstName: String!
    lastName: String!
  }

  type CoolerType {
    id: Int!
    name: String!
    description: String
  }

  type CoolerSubType {
    id: Int!
    name: String!
    description: String
  }

  type Visit {
    id: Int!
    customerId: Int!
    visitDate: DateTime!
    purpose: String
    status: String
  }

  # Input types for mutations
  input AssetMasterInput {
    assetTypeId: Int!
    assetSubTypeId: Int
    name: String!
    code: String!
    serialNumber: String
    purchaseDate: DateTime
    warrantyExpiry: DateTime
    currentLocation: String
    currentStatus: String
    assignedTo: String
    createdby: Int!
  }

  input CoolerInput {
    customerId: Int!
    code: String!
    assetMasterId: Int
    brand: String
    model: String
    serialNumber: String
    capacity: Int
    installDate: DateTime
    lastServiceDate: DateTime
    nextServiceDue: DateTime
    coolerTypeId: Int
    coolerSubTypeId: Int
    status: String
    temperature: Decimal
    energyRating: String
    warrantyExpiry: DateTime
    maintenanceContract: String
    technicianId: Int
    createdby: Int!
  }

  input CoolerInspectionInput {
    coolerId: Int
    visitId: Int
    inspectedBy: Int!
    inspectionDate: DateTime
    temperature: Decimal
    isWorking: String
    issues: String
    images: String
    latitude: Decimal
    longitude: Decimal
    actionRequired: String
    actionTaken: String
    nextInspectionDue: DateTime
    createdby: Int!
  }

  # Filter inputs
  input AssetMasterFilter {
    id: Int
    assetTypeId: Int
    assetSubTypeId: Int
    isActive: String
    name: String
    code: String
  }

  input CoolerFilter {
    id: Int
    customerId: Int
    assetMasterId: Int
    coolerTypeId: Int
    coolerSubTypeId: Int
    technicianId: Int
    isActive: String
    status: String
    code: String
  }

  input CoolerInspectionFilter {
    id: Int
    coolerId: Int
    visitId: Int
    inspectedBy: Int
    isActive: String
    isWorking: String
    actionRequired: String
  }

  # Queries
  type Query {
    # AssetMaster queries
    assetMasters(
      filter: AssetMasterFilter
      limit: Int
      offset: Int
    ): [AssetMaster!]!
    assetMaster(id: Int!): AssetMaster

    # Cooler queries
    coolers(filter: CoolerFilter, limit: Int, offset: Int): [Cooler!]!
    cooler(id: Int!): Cooler
    coolersByCustomer(customerId: Int!): [Cooler!]!

    # CoolerInspection queries
    coolerInspections(
      filter: CoolerInspectionFilter
      limit: Int
      offset: Int
    ): [CoolerInspection!]!
    coolerInspection(id: Int!): CoolerInspection
    coolerInspectionsByCooler(coolerId: Int!): [CoolerInspection!]!
    coolerInspectionsByInspector(inspectedBy: Int!): [CoolerInspection!]!
  }

  # Mutations
  type Mutation {
    # AssetMaster mutations
    createAssetMaster(input: AssetMasterInput!): AssetMaster!
    updateAssetMaster(id: Int!, input: AssetMasterInput!): AssetMaster!
    deleteAssetMaster(id: Int!): AssetMaster!

    # Cooler mutations
    createCooler(input: CoolerInput!): Cooler!
    updateCooler(id: Int!, input: CoolerInput!): Cooler!
    deleteCooler(id: Int!): Cooler!

    # CoolerInspection mutations
    createCoolerInspection(input: CoolerInspectionInput!): CoolerInspection!
    updateCoolerInspection(
      id: Int!
      input: CoolerInspectionInput!
    ): CoolerInspection!
    deleteCoolerInspection(id: Int!): CoolerInspection!
  }
`;
//# sourceMappingURL=typeDefs.js.map