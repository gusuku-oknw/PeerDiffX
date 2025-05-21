export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      // ユーザーテーブル
      users: {
        Row: {
          id: string
          username: string
          email: string | null
          firstName: string | null
          lastName: string | null
          organization: string | null
          isActive: boolean
          roleId: number | null
          lastLogin: string | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          username: string
          email?: string | null
          firstName?: string | null
          lastName?: string | null
          organization?: string | null
          isActive?: boolean
          roleId?: number | null
          lastLogin?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          username?: string
          email?: string | null
          firstName?: string | null
          lastName?: string | null
          organization?: string | null
          isActive?: boolean
          roleId?: number | null
          lastLogin?: string | null
          createdAt?: string
          updatedAt?: string
        }
      }
      
      // ロールテーブル
      roles: {
        Row: {
          id: number
          name: string
          description: string | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          createdAt?: string
          updatedAt?: string
        }
      }
      
      // パーミッションテーブル
      permissions: {
        Row: {
          id: number
          name: string
          description: string | null
          resource: string
          action: string
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          resource: string
          action: string
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          resource?: string
          action?: string
          createdAt?: string
          updatedAt?: string
        }
      }
      
      // ロールとパーミッションの関連付け
      role_permissions: {
        Row: {
          roleId: number
          permissionId: number
        }
        Insert: {
          roleId: number
          permissionId: number
        }
        Update: {
          roleId?: number
          permissionId?: number
        }
      }
      
      // プレゼンテーションテーブル
      presentations: {
        Row: {
          id: number
          name: string
          description: string | null
          createdAt: string
          updatedAt: string
          userId: string | null
          isPublic: boolean
          status: string
          thumbnail: string | null
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          createdAt?: string
          updatedAt?: string
          userId?: string | null
          isPublic?: boolean
          status?: string
          thumbnail?: string | null
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          createdAt?: string
          updatedAt?: string
          userId?: string | null
          isPublic?: boolean
          status?: string
          thumbnail?: string | null
        }
      }
      
      // プレゼンテーションアクセス管理
      presentation_access: {
        Row: {
          id: number
          presentationId: number
          userId: string
          accessLevel: string
          createdAt: string
          updatedAt: string
          createdBy: string | null
          expiresAt: string | null
        }
        Insert: {
          id?: number
          presentationId: number
          userId: string
          accessLevel: string
          createdAt?: string
          updatedAt?: string
          createdBy?: string | null
          expiresAt?: string | null
        }
        Update: {
          id?: number
          presentationId?: number
          userId?: string
          accessLevel?: string
          createdAt?: string
          updatedAt?: string
          createdBy?: string | null
          expiresAt?: string | null
        }
      }
      
      // ブランチテーブル
      branches: {
        Row: {
          id: number
          name: string
          description: string | null
          presentationId: number
          createdAt: string
          updatedAt: string
          isDefault: boolean | null
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          presentationId: number
          createdAt?: string
          updatedAt?: string
          isDefault?: boolean | null
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          presentationId?: number
          createdAt?: string
          updatedAt?: string
          isDefault?: boolean | null
        }
      }
      
      // コミットテーブル
      commits: {
        Row: {
          id: number
          message: string
          branchId: number
          userId: string | null
          parentId: number | null
          createdAt: string
        }
        Insert: {
          id?: number
          message: string
          branchId: number
          userId?: string | null
          parentId?: number | null
          createdAt?: string
        }
        Update: {
          id?: number
          message?: string
          branchId?: number
          userId?: string | null
          parentId?: number | null
          createdAt?: string
        }
      }
      
      // スライドテーブル
      slides: {
        Row: {
          id: number
          commitId: number
          slideNumber: number
          title: string | null
          content: Json
          thumbnail: string | null
          xmlContent: string
        }
        Insert: {
          id?: number
          commitId: number
          slideNumber: number
          title?: string | null
          content: Json
          thumbnail?: string | null
          xmlContent: string
        }
        Update: {
          id?: number
          commitId?: number
          slideNumber?: number
          title?: string | null
          content?: Json
          thumbnail?: string | null
          xmlContent?: string
        }
      }
      
      // 差分テーブル
      diffs: {
        Row: {
          id: number
          commitId: number
          slideId: number
          diffContent: Json
          xmlDiff: string | null
          changeType: string
        }
        Insert: {
          id?: number
          commitId: number
          slideId: number
          diffContent: Json
          xmlDiff?: string | null
          changeType: string
        }
        Update: {
          id?: number
          commitId?: number
          slideId?: number
          diffContent?: Json
          xmlDiff?: string | null
          changeType?: string
        }
      }
      
      // スナップショットテーブル
      snapshots: {
        Row: {
          id: string
          presentationId: number
          commitId: number
          slideId: number | null
          createdAt: string
          expiresAt: string
          accessCount: number
          data: Json | null
        }
        Insert: {
          id: string
          presentationId: number
          commitId: number
          slideId?: number | null
          createdAt?: string
          expiresAt: string
          accessCount?: number
          data?: Json | null
        }
        Update: {
          id?: string
          presentationId?: number
          commitId?: number
          slideId?: number | null
          createdAt?: string
          expiresAt?: string
          accessCount?: number
          data?: Json | null
        }
      }
      
      // コメントテーブル
      comments: {
        Row: {
          id: number
          slideId: number
          userId: string | null
          message: string
          createdAt: string
          updatedAt: string
          resolved: boolean | null
          parentId: number | null
        }
        Insert: {
          id?: number
          slideId: number
          userId?: string | null
          message: string
          createdAt?: string
          updatedAt?: string
          resolved?: boolean | null
          parentId?: number | null
        }
        Update: {
          id?: number
          slideId?: number
          userId?: string | null
          message?: string
          createdAt?: string
          updatedAt?: string
          resolved?: boolean | null
          parentId?: number | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}