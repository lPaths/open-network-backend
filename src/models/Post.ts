import { Document, Schema, model } from 'mongoose'
import { ObjectId } from 'mongodb'

export interface IPostImage {
  image: string
  imagePublicId: string
}

export interface IPost extends Document {
  title?: string
  images: Array<IPostImage>
  authorId: ObjectId
  isPrivate: boolean
  subscribers: Array<ObjectId>
}

const postSchema = new Schema(
  {
    title: String,
    images: [{ type: Object }],
    authorId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    isPrivate: {
      type: Boolean,
      required: true,
    },
    subscribers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
)

postSchema.set('toObject', {
  versionKey: false,
  transform: (doc, res) => {
    // Delete unused field
    delete res.__v

    // Assign id
    res.id = doc._id

    return res
  },
})

export default model<IPost>('Post', postSchema)
