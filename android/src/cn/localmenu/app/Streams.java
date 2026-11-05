package cn.localmenu.app;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.IOException;

final class Streams {
    private Streams() {}

    static byte[] read(InputStream input, int maximumBytes) throws IOException {
        try (InputStream in = input; ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            byte[] buffer = new byte[16384];
            int length;
            while ((length = in.read(buffer)) != -1) {
                if (out.size() + length > maximumBytes) throw new IOException("文件过大");
                out.write(buffer, 0, length);
            }
            return out.toByteArray();
        }
    }
}
