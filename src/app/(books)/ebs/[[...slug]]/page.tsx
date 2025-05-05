export default async function Ebs({ params }: { params: { slug: string[] } }) {
    const { slug } = await params; // [slug] параметрийг авах
    const slugString = slug.join("/"); // slug массивыг string болгон хөрвүүлэх
    return (
        <div>
        <h1>Dynamic Route: {slugString}</h1>
        <p>This is a dynamic route example.</p>
        </div>
    );
}
