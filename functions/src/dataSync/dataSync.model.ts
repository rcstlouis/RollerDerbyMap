export interface DataSyncRequestBody {
  collectionId: string
  docId: string
  userId: string
  operationType: 'create' | 'read' | 'update' | 'delete'
  eventData?: any
  leagueData?: any
}
