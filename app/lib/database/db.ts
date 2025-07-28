import { PrismaClient } from "@prisma/client";

const prismaClientSingelton=()=>{
    return new PrismaClient();
}
declare global{
    var prisma: undefined | ReturnType<typeof prismaClientSingelton>;
}
const prisma = globalThis.prisma ?? prismaClientSingelton();
if(process.env.NODE_ENV!=="production") global.prisma = prisma;
export default prisma;