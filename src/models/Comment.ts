import { Document, Schema, model } from 'mongoose'
import { ObjectId } from 'mongodb'

export interface IComment extends Document {
  comment?: string
  image?: string
  imagePublicId?: string
  stickerId?: ObjectId
  postId: ObjectId
  authorId: ObjectId
}

const commentSchema = new Schema(
  {
    comment: String,
    image: String,
    imagePublicId: String,
    stickerId: {
      type: Schema.Types.ObjectId,
      ref: 'Sticker',
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
)

commentSchema.set('toObject', {
  versionKey: false,
  transform: (doc, res) => {
    // Delete unused field
    delete res.__v

    // Assign id
    res.id = doc._id

    return res
  },
})

export default model<IComment>('Comment', commentSchema)
