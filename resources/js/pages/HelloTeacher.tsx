export default function HelloTeacher() {
    return (
        <div>
            <h1>Greeting to all teachers of computer science</h1>
            <Greeting name="ชวลิต" lastname="โควีระวงศ์" />
            <Greeting name="ณัฐรดี" lastname="อนุพงค์" />
            <Greeting name="วิศรุต" lastname="ขวัญคุ้ม" />
            <Greeting name="ดาวรถา" lastname="วีระพันธ์" />
            <Greeting name="ประณมกร" lastname="อัมพรพรรดิ์" />
            <Greeting name="ณัฏฐิรา" lastname="ศุขไพบูลย์" />
            {/* name กับ lastname คือ props(properties) หรือเรียกว่า attribute ก็ได้ */}
        </div>
    );
}

function Greeting({ name, lastname } : any) {
    return <h1>Hello, My name is: { name } { lastname } !</h1>;
}
