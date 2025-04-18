import express, {Application} from 'express'
const app: Application = express()
const port: number = 3000

app.get('/world', (req: any, res: any) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

export default app;