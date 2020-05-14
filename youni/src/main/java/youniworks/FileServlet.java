package youniworks;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.Writer;
import java.lang.reflect.Type;
import java.util.Map;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

public class FileServlet extends HttpServlet {

	private static final long serialVersionUID = 1L;
	private static final int EOF = -1;
	
	private static Type TYPE = new TypeToken<Map<String, Object>>(){}.getType();

	private Gson gson = new Gson();
	private File directory;
	private int bufferSize = 1024;
	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		Map<String, Object> pack = gson.fromJson(req.getReader(), TYPE);
		for (String name : pack.keySet()) {
			File f = new File(directory, name);
			f.getParentFile().mkdirs();
			Writer w = new FileWriter(f);
			w.write(pack.get(name).toString());
			w.close();
		}
	}
	
	protected void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		String name = req.getQueryString();
		if (name == null) name = "";
		File f = new File(directory, name);
		InputStream i;
		try {
			i = new FileInputStream(f);			
		} catch (FileNotFoundException e) {
			resp.setStatus(404);
			return;
		}
		OutputStream o = resp.getOutputStream();
		byte[] buffer = new byte[bufferSize];
		for (int n = i.read(buffer); n != EOF; n = i.read(buffer)) {
			o.write(buffer);
		}
		i.close();
	}
	
	@Override
	public void init(ServletConfig config) throws ServletException {
		this.directory = new File(config.getInitParameter("directory"));
		try {
			String value = config.getInitParameter("bufferSize");
			if (value != null && value.length() > 0) {
				this.bufferSize = Integer.parseInt(value);
			}
		} catch (NumberFormatException e) {
			throw new ServletException(e);
		}
	}
}
