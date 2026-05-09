import 'package:flutter/material.dart';

class MapScreen extends StatelessWidget {
  const MapScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Fishermen Tracking'),
        centerTitle: true,
      ),
      body: Stack(
        children: [
          // TODO: Implement Google Maps widget
          Container(
            color: Colors.lightBlue,
            child: const Center(
              child: Text('Google Maps will be integrated here'),
            ),
          ),
          // TODO: Add custom markers for fishermen
          // TODO: Add info windows for alert details
        ],
      ),
    );
  }
}
