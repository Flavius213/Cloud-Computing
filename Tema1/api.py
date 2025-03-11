import http.server
import json
import xml.etree.ElementTree as ET
from urllib.parse import urlparse, parse_qs

XML_FILE = 'data.xml'

def init_xml():
    try:
        tree = ET.parse(XML_FILE)
    except FileNotFoundError:
        root = ET.Element('books')
        tree = ET.ElementTree(root)
        tree.write(XML_FILE)

def load_books():
    try:
        tree = ET.parse(XML_FILE)
        root = tree.getroot()
        books = []
        for book in root.findall('book'):
            books.append({
                'id': book.find('id').text,
                'title': book.find('title').text,
                'author': book.find('author').text
            })
        return books
    except Exception as e:
        print(f"Error loading books: {e}")
        raise

def save_books(books):
    try:
        root = ET.Element('books')
        for book in books:
            book_elem = ET.SubElement(root, 'book')
            ET.SubElement(book_elem, 'id').text = str(book['id'])
            ET.SubElement(book_elem, 'title').text = book['title']
            ET.SubElement(book_elem, 'author').text = book['author']
        tree = ET.ElementTree(root)
        tree.write(XML_FILE)
    except Exception as e:
        print(f"Error saving books: {e}")
        raise

class BookAPI(http.server.BaseHTTPRequestHandler):
    def _set_headers(self, status_code=200):
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json')
        self.end_headers()

    def _parse_path(self):
        path = urlparse(self.path).path
        parts = path.split('/')[1:]
        return parts

    def _get_book(self, book_id):
        books = load_books()
        for book in books:
            if book['id'] == book_id:
                return book
        return None

    def do_GET(self):
        try:
            parts = self._parse_path()
            if parts[0] == 'books':
                if len(parts) == 1:
                    books = load_books()
                    self._set_headers(200)
                    self.wfile.write(json.dumps(books).encode())
                elif len(parts) == 2:
                    book_id = parts[1]
                    book = self._get_book(book_id)
                    if book:
                        self._set_headers(200)
                        self.wfile.write(json.dumps(book).encode())
                    else:
                        self._set_headers(404)
                        self.wfile.write(json.dumps({'error': 'Book not found'}).encode())
                else:
                    self._set_headers(400)
                    self.wfile.write(json.dumps({'error': 'Invalid request'}).encode())
            else:
                self._set_headers(404)
                self.wfile.write(json.dumps({'error': 'Resource not found'}).encode())
        except Exception as e:
            print(f"Internal Server Error: {e}")
            self._set_headers(500)
            self.wfile.write(json.dumps({'error': 'Internal Server Error'}).encode())

    def do_POST(self):
        try:
            parts = self._parse_path()
            if parts[0] == 'books' and len(parts) == 1:
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data)
                title = data.get('title')
                author = data.get('author')
                if title and author:
                    books = load_books()
                    new_id = str(len(books) + 1)
                    new_book = {'id': new_id, 'title': title, 'author': author}
                    books.append(new_book)
                    save_books(books)
                    self._set_headers(201)
                    self.wfile.write(json.dumps(new_book).encode())
                else:
                    self._set_headers(400)
                    self.wfile.write(json.dumps({'error': 'Missing title or author'}).encode())
            else:
                self._set_headers(400)
                self.wfile.write(json.dumps({'error': 'Invalid request'}).encode())
        except Exception as e:
            print(f"Internal Server Error: {e}")
            self._set_headers(500)
            self.wfile.write(json.dumps({'error': 'Internal Server Error'}).encode())

    def do_PUT(self):
        try:
            parts = self._parse_path()
            if parts[0] == 'books' and len(parts) == 2:
                book_id = parts[1]
                book = self._get_book(book_id)
                if book:
                    content_length = int(self.headers['Content-Length'])
                    put_data = self.rfile.read(content_length)
                    data = json.loads(put_data)
                    title = data.get('title', book['title'])
                    author = data.get('author', book['author'])
                    books = load_books()
                    for b in books:
                        if b['id'] == book_id:
                            b['title'] = title
                            b['author'] = author
                            break
                    save_books(books)
                    self._set_headers(200)
                    self.wfile.write(json.dumps({'id': book_id, 'title': title, 'author': author}).encode())
                else:
                    self._set_headers(404)
                    self.wfile.write(json.dumps({'error': 'Book not found'}).encode())
            else:
                self._set_headers(400)
                self.wfile.write(json.dumps({'error': 'Invalid request'}).encode())
        except Exception as e:
            print(f"Internal Server Error: {e}")
            self._set_headers(500)
            self.wfile.write(json.dumps({'error': 'Internal Server Error'}).encode())

    def do_DELETE(self):
        try:
            parts = self._parse_path()
            if parts[0] == 'books' and len(parts) == 2:
                book_id = parts[1]
                books = load_books()
                book = self._get_book(book_id)
                if book:
                    books = [b for b in books if b['id'] != book_id]
                    save_books(books)
                    self._set_headers(204)
                else:
                    self._set_headers(404)
                    self.wfile.write(json.dumps({'error': 'Book not found'}).encode())
            else:
                self._set_headers(400)
                self.wfile.write(json.dumps({'error': 'Invalid request'}).encode())
        except Exception as e:
            print(f"Internal Server Error: {e}")
            self._set_headers(500)
            self.wfile.write(json.dumps({'error': 'Internal Server Error'}).encode())

def run(server_class=http.server.HTTPServer, handler_class=BookAPI, port=8000):
    init_xml()
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f'Starting server on port {port}...')
    httpd.serve_forever()

if __name__ == '__main__':
    run()